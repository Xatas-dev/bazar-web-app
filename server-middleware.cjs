module.exports = (req, res, next) => {
  // Handle GET /bazar-chat/api/chats/:chatId/messages - rewrite to /messages?chatId=:id
  if (req.path.match(/\/bazar-chat\/api\/chats\/(\d+)\/messages/) && req.method === 'GET') {
    const chatId = req.path.match(/\/bazar-chat\/api\/chats\/(\d+)\/messages/)[1];
    req.url = `/messages?chatId=${chatId}&${new URLSearchParams(req.query).toString()}`;
    req.path = '/messages';
  }

  // Intercept messages endpoint to return paginated response
  if (req.path.includes('/messages') && req.method === 'GET') {
    // Store original send function
    const originalSend = res.send;

    res.send = function(data) {
      try {
        const messages = JSON.parse(data);

        // If it's already an array (from json-server), wrap it in pagination structure
        if (Array.isArray(messages)) {
          const page = parseInt(req.query.page) || 0;
          const size = parseInt(req.query.size) || 20;
          const sort = req.query.sort || 'createdAt,desc';

          // Sort messages
          let sortedMessages = [...messages];
          if (sort.includes('desc')) {
            sortedMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          } else {
            sortedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          }

          // Paginate
          const start = page * size;
          const end = start + size;
          const paginatedMessages = sortedMessages.slice(start, end);

          // Add canDelete attribute to each message
          // User with id "1" can delete their own messages
          const messagesWithCanDelete = paginatedMessages.map(msg => ({
            ...msg,
            isDeletable: msg.userId === "1" // Current user is "1" in mock
          }));

          const paginatedResponse = {
            content: messagesWithCanDelete,
            page: page,
            pageSize: size,
            totalElements: sortedMessages.length,
            totalPages: Math.ceil(sortedMessages.length / size)
          };

          return originalSend.call(this, JSON.stringify(paginatedResponse));
        }
      } catch (e) {
        // If parsing fails, just send original data
      }

      return originalSend.call(this, data);
    };
  }

  // Intercept chats endpoint to return single chat object instead of array
  if (req.path.includes('/chats') && !req.path.includes('/messages') && req.method === 'GET' && req.query.spaceId) {
    const originalSend = res.send;

    res.send = function(data) {
      try {
        const chats = JSON.parse(data);

        // If it's an array with items, return the first one
        if (Array.isArray(chats) && chats.length > 0) {
          return originalSend.call(this, JSON.stringify(chats[0]));
        }
      } catch (e) {
        // If parsing fails, just send original data
      }

      return originalSend.call(this, data);
    };
  }

  // Handle DELETE /chats/:chatId/messages
  if (req.path.match(/\/chats\/\d+\/messages/) && req.method === 'DELETE') {
    const fs = require('fs');
    const path = require('path');

    // Read request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { messageIds } = JSON.parse(body);

        // Read db.json
        const dbPath = path.join(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        // Filter out messages with matching IDs
        db.messages = db.messages.filter(msg => !messageIds.includes(msg.id));

        // Write back to db.json
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        // Send success response
        res.status(204).send();
      } catch (e) {
        res.status(400).json({ error: 'Invalid request' });
      }
    });

    return; // Don't call next()
  }

  next();
};
