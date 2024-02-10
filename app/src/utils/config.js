// configurations

let endpoints = [
  { method: 'GET', path: '/chats', description: 'Get a list of chats.' },
  { method: 'POST', path: '/chats', description: 'Create a new chat.' },
  { method: 'GET', path: '/chats/{chat_id}', description: 'Get a specific chat.' },
  { method: 'PATCH', path: '/chats/{chat_id}', description: 'Update a chat.' },
  { method: 'DELETE', path: '/chats/{chat_id}', description: 'Delete a chat.' },
  { method: 'GET', path: '/chats/{chat_id}/messages', description: 'Get a list of messages in a chat.' },
  { method: 'POST', path: '/chats/{chat_id}/messages', description: 'Create a new message in a chat.' },
  { method: 'PATCH', path: '/chats/messages/{message_id}', description: 'Edit an existing message. You must provide both the original message ID and the updated message contents.' },
  { method: 'DELETE', path: '/chats/messages/{message_id}', description: 'Delete an existing message.' },
  { method: 'GET', path: '/users', description: 'Get a list of users.' },
  { method: 'POST', path: '/users', description: 'Create a new user.' },
  { method: 'GET', path: '/users/{user_id}', description: 'Get user details by ID.' },
  { method: 'PUT', path: '/users/{user_id}', description: 'Update user details by ID.' },
  { method: 'DELETE', path: '/users/{user_id}', description: 'Delete user by ID.' },
  { method: 'GET', path: '/users/{user_id}/chats', description: 'Get a list of chats for a specific user.' },
  { method: 'GET', path: '/chats/{chat_id}/participants', description: 'Get a list of participants in a chat.' },
  { method: 'POST', path: '/chats/{chat_id}/participants', description: 'Add a participant to a chat.' },
  { method: 'DELETE', path: '/chats/{chat_id}/participants/{user_id}', description: 'Remove a participant from a chat.' },
  { method: 'GET', path: '/groups', description: 'Get a list of groups.' },
  { method: 'POST', path: '/groups', description: 'Create a new group.' },
  { method: 'GET', path: '/groups/{group_id}', description: 'Get group details by ID.' },
  { method: 'PUT', path: '/groups/{group_id}', description: 'Update group details by ID.' },
  { method: 'DELETE', path: '/groups/{group_id}', description: 'Delete group by ID.' },
  { method: 'GET', path: '/groups/{group_id}/members', description: 'Get a list of members in a group.' },
  { method: 'POST', path: '/groups/{group_id}/members', description: 'Add a member to a group.' },
  { method: 'DELETE', path: '/groups/{group_id}/members/{user_id}', description: 'Remove a member from a group.' },
]


module.exports = {
    endpoints
};
