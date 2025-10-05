#Github Repoistory
1. **Github repository version control**
    i. Each task got a seperate commit towards the development branch when the task was functional without issues
	ii. After the last task has been completed for the day and the development branch was functional development was merged with the master branch
#Data Structures
##Json Files
1. **users.json**
    i. Each entry represents a registered user with login details, role, group and approvals
    ii. Username is a unique username for login
    iii. Password is stored as a text file and does not get passed through the front end
    iv. Email is a unique email address
    v. Role defines the user’s access level of SuperAdmin, GroupAdmin or User
    vi. Groups is an array of group ids the user currently has access to
    vii. Applied groups is an array of group ids the user has applied to join
    viii. Valid indicated if the user has been approved for login
  ```json
{
    "username": "super",
    "password": "123",
    "email": "test@example.com",
    "role": "SuperAdmin",
    "groups": [ 1, 2 ],
    "appliedGroups": [ 1 ],
    "valid": true
  }
```
2. **notifications.json**
    i. Each entry represents a notification of a ban created by an admin
    ii. Createdby is the username of the admin who created the notification
    iii. Description is the system created details of the username of the banned user and the group id of the group they were banned from
    iv. Reason is the admin inputted reason the user was banned
```json
  {
    "createdBy": "super",
    "description": "Banned test from Group 1",
    "reason": "Spam"
  }
```
3. **messages.json**
    i. Each entry represents a message sent by a user in a channel of a group
    ii. GroupID is the id of the group the message belongs to
    iii. Channel is the name of the channel within the group where the message was sent
    iv. Sender is the username of the user who sent the message
    v. Text is the content of the message
```
  {
    "groupID": 2,
    "channel": "general",
    "sender": "super",
    "text": "Group A First Message"
  },
```
4. **groups.json**
    i. Each entry represents a group in the system
    ii. Id is the unique identifier for the group
    iii. Name is the groups displayed name
    iv. Admins is an array of the usernames that have admin rights in the group, not including super admins
    v. channels is an array of the channels within the group
    vi. Banned is an array of the banned usernames from the group
```
  {
    "id": 1,
    "name": "Group A",
    "admins": [ "super" ],
    "channels": [ "general", "random" ],
    "banned": [ "Nik"  ]
  },
```
##Classes
1. **User Class**
    i. Defines the blueprint for creating user objects
    ii. Automatically sets the default role to `User` and `valid` to `false`
```
class User {
constructor(username, email, password, role = 'User', groups = [], appliedGroups = []) {
        this.username = username; //Unique
        this.email = email; //Unique
        this.password = password;
        this.role = role; // 'SuperAdmin', 'GroupAdmin', 'User'
        this.groups = groups;
        this.appliedGroups = appliedGroups;
        this.valid = false; //Login Approval
    }
}
```
2. **Group Class**
    i. Defines the blueprint for creating group objects
    ii. No default fields
```
class Group {
    constructor(id, name, admins = [], channels = [], banned = []) {
        this.id = id; //Unique
        this.name = name;
        this.admins = admins;
        this.channels = channels;
        this.banned = banned; //usernames
    }
}
```
3. **Messages Class**
    i. Defines the blueprint for creating message objects
    ii. No default fields
```
class Messages {
    constructor(groupID, channel, sender, text) {
        this.groupID = groupID;
        this.channel = channel;
        this.sender = sender; //usernames
        this.text = text;
    }
}
```
4. **Notification Class*
    i. Defines the default blueprint for creating notification objects
    ii. No default fields
```
class Notifications {
    constructor(createdBy, description, reason) {
        this.createdBy = createdBy; //usernames
        this.description = description;
        this.reason = reason;
    }
}
```
#Http Apis
1. **Getting all users for user management**
    i. Endpoint is `get /api/users`
    ii. Retrieves a list of all users
    iii. No input in the body
**Output**
```json
[
    {
        "username": "Nik",
        "email": "Nik@example.com",
        "role": "user",
        "groups": [1],
        "appliedGroups": [],
        "valid": true
    },
    {
        "username": "super",
        "email": "super@example.com",
        "role": "SuperAdmin",
        "groups": [1],
        "appliedGroups": [],
        "valid": true
    }
]
```
2. **Getting all notifications**
    i. Endpoint is `get /api/notifications`
    ii. Retrieves all system notifications
    iii. No input in the body
**Output**
```json
[
    {
        "createdBy": "super",
        "description": "Banned Nik from Group 1"
        "reason": "spam"
    },
	{
        "createdBy": "super",
        "description": "Banned Nik from Group 2"
        "reason": "spam"
    }
]
```
3. **Getting all groups**
    i. Endpoint is `get /api/groups`
    ii. Retrieves a list of all groups
    iii. No input in the body
**Output**
```json
[
    {
        "id": 1,
        "name": "Group A"
        "admins": ["super"],
        "channels": ["general", "random"]
        "banned": ["Nik"]
    },
	{
        "id": 2,
        "name": "Group B"
        "admins": ["super"],
        "channels": ["general"]
        "banned": []
    }
]
```
4. **Get all messages in a channel**
    i. Endpoint is `get /api/messages`
    ii. Retrives all messages from a specific channel
	iii. No input in the body
    iv. Query parameters include `groupId` which is the id of the group and `channel` which is the name of the channel within the group
**Output**
```json
[
    {
        "groupID": 2,
        "channel": "general"
        "sender": "super",
        "text": "Group A first message"
    },
	{
        "groupID": 2,
        "channel": "general"
        "sender": "Nik",
        "text": "Group A second message"
    }
]
```
5. **Login**
    i. Endpoint is `post /api/users/login`
    ii. Authenticates a user using their username and password
**Input Request Body**
```json
{
    "username": "Nik",
    "password": "123"
}
```
**Output**
```json
{
    "username": "Nik",
    "email": "Nik@example.com",
    "role": "user",
    "groups": [1],
    "appliedGroups": [],
    "valid": true
}
```
**Error response**
```json
{
    "valid": false,
    "message": "Account not approved by super admin."
}
```
```json
{
    "valid": false,
    "message": "Invalid username or password."
}
```
6. **Logout**
    i. Endpoint is `post /api/users/logout`
    ii. Logs out the current user
    iii. No input in the body
**Output**
```json
{
    "message": "Logout successful"
}
```
7. **Register**
    i. Endpoint is `post /api/users/register`
    ii. Registers a new user
**Input Request Body**
```json
{
    "username": "Nik",
    "email": "nik@example.com",
    "password": "123"
}
```
**Output**
```json
{
    "success": true
}
```
**Error response**
```json
{
    "message": "Username, email, and password are required."
}
```
```json
{
    "message": "Username already exists."
}
```
```json
{
    "message": "Email already registered."
}
```
8. **Approve user for login**
    i. Endpoint is `post /api/users/approve`
    ii. Approves a user account for login
**Input Request Body**
```json
{
    "username": "Nik"
}
```
**Output**
```json
{
    "success": true
}
```
**Error response**
```json
{
    "message": "User not found."
}
```
9. **Update user roles**
    i. Endpoint is `post /api/user/updateRoles`
    ii. updates the role of a specific user
**Input Request Body**
```json
{
    "username": "Nik",
    "role": "GroupAdmin"
}
```
**Output**
```json
{
    "success": true
}
```
**Error response**
```json
{
    "message": "User not found."
}
```
10. **Delete user**
    i. Endpoint is `delete /api/users/:username`
    ii. Deletes a user
    iii. Removes the user from all group admin and ban lists
    iv. No inputs in the body
    v. Path parameters include `username` which is the username of the user to delete
**Output**
```json
{
    "success": true
}
```
**Error response**
```json
{
    "message": "User not found."
}
```
11. **Create a new group**
    i. Endpoint is `post /api/groups`
    ii. Creates a new group with a unique Id
    iii. If the creator has the `GroupAdmin` role, the user is added to the admin and user lists
**Input Request Body**
```json
{
    "name": "Group A",
    "creator": "super",
    "role": "GroupAdmin"
}
```
**Output**
```json
{
    "success": true,
    "group": {
        "id": 1,
        "name": "Group A",
        "admins": ["super"]
        "channels": [],
        "banned": []
    }
}
```
12.  **Create a new channel within a group**
    i. Endpoint is `post /api/groups/:groupId/channels`
    ii. Adds a new channel to the specified group
    iii. Path parameters include `groupId` which is where the channel will be created
**Input Request Body**
```json
{
    "channel": "general",
    "username": "super",
    "role": "SuperAdmin"
}
```
**Output**
```json
{
    "success": true,
    "group": {
        "id": 1,
        "name": "Group A",
        "admins": ["super"]
        "channels": ["general", "random"],
        "banned": []
    }
}
```
**Error response**
```json
{
    "message": "Group not found."
}
```
```json
{
    "message": "Channel already exists."
}
```
13. **Delete a group**
    i. Endpoint is `delete /api/groups/:groupId`
    ii. Deletes a group by its id
    iii. Removes all messages being to that group
    iv. Removes the group id from every user's group list
    v. No inputs in the body
    vi. Path parameters include `groupid` which is the Id of the group to delete
**Output**
```json
{
    "success": true
}
```
**Error response**
```json
{
    "message": "Group not found"
}
```
14. **Delete a channel**
    i. Endpoint is `delete /api/groups/:groupId/channels/:channel`
    ii. Deletes a channel from a specified group
    iii. Removes all messages belonging to that channel
    iv. No inputs in body
    v. Path parameters include `groupid` which is the id of the group where the channel will be created
**Output**
```json
{
    "success": true
}
```
**Error response**
```json
{
    "message": "Group not found"
}
```
```json
{
    "message": "Channel not found"
}
```
15. **Apply to a group**
    i. Endpoint is `post /api/users/updateAppliedGroups`
    ii. Updates the list of groups a user has applied to join
**Input Request Body**
```json
{
    "username": "Nik",
    "appliedGroups": [2]
}
```
**Output**
```json
{
    "success": true
}
```
**Error Response**
```json
{
    "error": "User not found"
}
```
16. **Update user’s group**
    i. Endpoint is `post /api/users/updateGroups`
    ii. Updates the list of groups a user belongs to
    iii. Removing a user from a group also removes the user from the group's admin list
**Input Request Body**
```json
{
    "username": "Nik",
    "groups": [1,2]
}
```
**Output**
```json
{
    "success": true
}
```
**Error Response**
```json
{
    "error": "User not found"
}
```
17. **Promoting a user in a group**
    i. Endpoint is `post /api/groups/:groupId/promoteAdmin`
    ii. Adds a user to a group's admin list
    iii. Path parameters include `groupid` which is the Id of the group where the promotion is happening
**Input Request Body**
```json
{
    "username": "Nik"
}
```
**Output**
```json
{
    "success": true
}
```
18. **Demoting a group admin in a group**
    i. Endpoint is `post /api/groups/:groupId/demoteAdmin`
    ii. Removes a user from a group's admin list, demoting them back to a normal user
    iii. Path parameters include `groupid` which is the Id of the group where the demotion is happening
**Input Request Body**
```json
{
    "username": "Nik"
}
```
**Output**
```json
{
    "success": true
}
```
19. **Banning a user from a group**
    i. Endpoint is `post /api/groups/:groupId/ban`
    ii. Removes a user from a specific group, adds them to the group's banned list and creates a notification with the reason for the ban
**Input Request Body**
```json
{
    "username": "Nik",
	"reason": "Spam",
	"createdBy": "super"
}
```
**Output**
```json
{
    "success": true
}
```
20. **Send a message within a channel**
    i. Endpoint is `post /api/messages`
    ii. Creates and stores a new message
**Input Request Body**
```json
{
    "groupid": 1,
    "channel": "general",
    "sender": "super",
    "text": "Group a First Message"
}
```
**Output**
```json
{
    "success": true,
    "message": {
        "groupid": 1,
        "channel": "general",
        "sender": "super",
        "text": "Group a First Message"
    }
}
```
#Components, Services and Models
1. **App Component**
    i. Base component holding router outlet
    ii. Managing the user’s authentication state
    iii. Blocks users from selecting components other than the login when not authorised
    iv. Can log the user out
2. **Login Component**
    i. Used to accept user credentials
    ii. Used to create new user credentials
    iii. Blocking user login until approved by super admin
    iv. Navigating to profile component on successful login
    v. Interacts with auth and user services
    vi. Can be accessed by unauthorised users
3. **Profile Component**
    i. Allows for deletion of user account by user
    ii. Interacts with auth and user services
    iii. Can not be accessed by unauthorised users
4. **Dashboard Component**
    i. Loads and displays the groups a user is in
    ii. Allows the user to select a group the user is in
    iii. Displays the channels of the group selected
    iv. Loads and displays the messages of the selected channel
    v. Allows users to send messages to the selected channel
    vi. Interacts with auth, group and chat services
    vi. Can be accessed by all roles once authorised
5. **User Management Component**
    i. Displays a list of all users and notifications
    ii. Allows for approval of user account login after user registration
    iii. Allows deletion of users and notifications
    iv. Allows promotion and demotion of user roles
    v. Does not allow for editing of super user details
    vi. Interacts with user and auth services
    vii. Can be accessed by super admin role
6. **Group Management Component**
    i. Displays and loads all groups
    ii. Allows the user to select a group 
    iii. Displays and loads all users, group join requests, channels
    iv. Allows the user to leave a group if the user is not super admin
    v. Allows the user to apply to a group if the user is not a super admin
    vi. Allows a user to be promoted to a group admin of a specific group by a group admin or super admin if the user has the group admin role
    vii. Allows a group admin to be demoted to a user of a specific group by a group admin or super admin
    viii. Allows a group admin to remove a user or group admin from a specific group
    ix. Allows a group admin to ban a user or group admin from a specific group with a reason specified
    x. Displays banned if a user is banned from a group and hides the apply button
    xi. Allows a group admin or super admin to delete a channel or group if they have the admin role in a specific group
    xii. Allows a group admin or super admin to create a new channel within a selected group
    xiii. Allows a group admin or super admin to create a new group
    xiv. Interacts with auth, group and user services
    xv. Can be accessed by all roles once authorised
7. Auth service
    i. Login and logout users with the backend
    ii. Save and retrieve all user details using local storage
    iii. Check if the user is logged in
    iv. Returns observables for asynchronous data
    v. Tracks the user with behaviour subject 
8. User Service
    i. Retrieve all users and notifications
    ii. Register new users
    iii. Approve users for login
    iv. Update user roles and group roles
    v. Delete users
    vi. Ban users from groups
    vii. Returns observables for asynchronous data
9. Group Service
    i. Retrieves all groups
    ii. Promote user and demote group admin from a group
    iii. Creating new groups and channels
    iv. Deleting groups and channels
    v. Returns observables for asynchronous data
10. Chat Service
    i. Retrieves all messages for a specific channel within a group
    ii. Sends new messages to the server
    iii. Returns observables for asynchronous data
11. User Model
    i. Represents a registered user
    ii. Stores login credentials, roles, groups, group join requests and login approval
    iii. Each user has a unique username and email
    iv. Password is not saved in the model for security reasons
    v. Roles include SuperAdmin, GroupAdmin, User
12. Group Model
    i. Represents a group
    ii. Stores id, name, channels, banned users and admins
    iii. Each group has a unique id
    iv. Groups can have multiple channels
    v. Tracks who is an admins of the group which is the usernames of admins
    vi. Tracks which users are banned using their usernames
13. Notification Model
    i. Represents a system notification created by a user
    ii. Stores the Admin username who banned the user, the description and the reason for the ban
    iii. Used to record when a user was banned from a group
14. Message Model
    i. Represents a single chat message within a group channel
    ii. Stores the sender’s username, message, channel sent in and group sent in
    iii. Each message is linked to a group id and channel name

###Commiting to github
1. **Commiting to development branch**
    i. git checkout development
    ii. git add .
    iii. git commit -m "commit"
    iv. git push origin development
2. **Merging development branch with master**
    i.git checkout master
    ii. git pull origin master
    iii. git merge development
    iv. git push origin master

###Starting the application
1. **Navigate to the server folder**
    i. cd server
2. **Start the backend**
    i. npm start
3. **Open a new terminal**
4. **Start the frontend**
    i. ng serve

###Resetting the database
1. **Navigate to the App folder inside server**
    i. cd server/App
2. **run reset file**
    ii. node reset.js