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

          const paginatedResponse = {
            content: paginatedMessages,
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

  // Handle /bazar-space/api/space logic
  // Note: routes.json rewrites /bazar-space/api/space to /spaces, so we check both paths
  if (req.path === '/bazar-space/api/space' || req.path === '/spaces') {
    if (req.method === 'GET') {
      const originalSend = res.send;
      res.send = function(data) {
        try {
          const spaces = JSON.parse(data);
          if (Array.isArray(spaces)) {
            return originalSend.call(this, JSON.stringify({ spaces }));
          }
        } catch (e) {}
        return originalSend.call(this, data);
      };
    } else if (req.method === 'POST') {
      if (req.query.name) {
         const fs = require('fs');
         const path = require('path');
         const dbPath = path.join(__dirname, 'db.json');
         const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

         const maxId = db.spaces.reduce((max, s) => Math.max(max, s.id), 0);
         const newSpace = { id: maxId + 1, name: req.query.name };

         db.spaces.push(newSpace);
         fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

         res.status(201).json(newSpace);
         return;
      }
    }
  }

  // Handle /bazar-space/api/space/:id PATCH
  if (req.path.match(/\/bazar-space\/api\/space\/\d+/) && req.method === 'PATCH') {
    const id = Number(req.path.match(/\/bazar-space\/api\/space\/(\d+)/)[1]);
    const name = req.query.name;

    if (name && !isNaN(id)) {
        const fs = require('fs');
        const path = require('path');
        const dbPath = path.join(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const space = db.spaces.find(s => s.id === id);

        if (space) {
            space.name = name;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            res.json(space);
            return;
        }
    }
  }

  // Handle /bazar-space/api/space/:id/user GET
  if (req.path.match(/\/bazar-space\/api\/space\/\d+\/user/) && req.method === 'GET') {
    const originalSend = res.send;
    res.send = function(data) {
      try {
        const result = JSON.parse(data);
        if (Array.isArray(result)) {
           if (result.length > 0 && result[0].userIds) {
               return originalSend.call(this, JSON.stringify(result[0].userIds));
           }
           if (result.length === 0) {
               return originalSend.call(this, JSON.stringify([]));
           }
        }
      } catch (e) {}
      return originalSend.call(this, data);
    };
  }

  // Handle POST /bazar-space/api/space/user
  if (req.path === '/bazar-space/api/space/user' && req.method === 'POST') {
     const fs = require('fs');
     const path = require('path');
     const { spaceId, userId } = req.body;

     if (spaceId && userId) {
        const dbPath = path.join(__dirname, 'db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const spaceUsers = db.space_users.find(su => su.spaceId === Number(spaceId));

        if (spaceUsers) {
            if (!spaceUsers.userIds.includes(userId)) {
                spaceUsers.userIds.push(userId);
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            }
            res.status(200).send();
            return;
        } else {
             db.space_users.push({
                 spaceId: Number(spaceId),
                 userIds: [userId]
             });
             fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
             res.status(200).send();
             return;
        }
     }
  }

  // Handle DELETE /bazar-space/api/space/:spaceId/user/:userId
  if (req.path.match(/\/bazar-space\/api\/space\/\d+\/user\/.+/) && req.method === 'DELETE') {
     const fs = require('fs');
     const path = require('path');
     const match = req.path.match(/\/bazar-space\/api\/space\/(\d+)\/user\/(.+)/);
     const spaceId = Number(match[1]);
     const userId = match[2];

     const dbPath = path.join(__dirname, 'db.json');
     const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
     const spaceUsers = db.space_users.find(su => su.spaceId === spaceId);

     if (spaceUsers) {
         spaceUsers.userIds = spaceUsers.userIds.filter(id => id !== userId);
         fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
     }
     res.status(200).send();
     return;
  }

  next();
};
