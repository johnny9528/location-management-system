import ajax from './ajax'

const BASE = ''

/*
   account类api
*/

// 管理员登录
export const reqAdminLogin = (username, password) => ajax(BASE + '/admin/account/login', {username, password}, 'POST')

//用户登陆
export const reqUserLogin = (username, password) => ajax(BASE + '/account/login', {username, password}, 'POST')

//用户注册
export const reqUserRegister = (username, email, password) => ajax(BASE + '/account/register', {username, email, password}, 'POST')

//检查密码是否存在
export const reqCheckName = (username) => ajax(BASE + '/account/checkName', {username})

//用户找回密码
export const reqUserGetBackPassword = (username, email, password) => ajax(BASE + '/account/getBackPassword', {username, email, password}, 'POST')

// 用户修改密码
export const reqUserUpdatePassword = (username, oldPassword, newPassword) => ajax(BASE + '/account/updatePassword', {username, oldPassword, newPassword}, 'POST')

/*
   anchor类api
*/

//admin获得anchor
export const reqAnchors = () => ajax(BASE + '/admin/anchor')

//admin添加anchor
export const reqAddAnchor = (aId, x, y, A, N) => ajax(BASE + '/admin/anchor', {aId, x, y, A, N}, 'POST')

//admin修改anchor
export const reqUpdateAnchor = (id, aId, x, y, A, N) => ajax(BASE + '/admin/anchor', {id, aId, x, y, A, N}, 'PUT')

//admin修改anchor
export const reqDeleteAnchor = (id) => ajax(BASE + '/admin/anchor', {id}, 'DELETE')

//user获得anchor
export const reqUserAnchors = () => ajax(BASE + '/anchor')

/*
   tag类api
*/

//admin获得tag
export const reqTags = () => ajax(BASE + '/admin/tag')

//admin搜索tag
export const reqSearchTags = (searchType, searchKey) => ajax(BASE + '/admin/tag/search', {[searchType]: searchKey})

//admin添加tag
export const reqAddTag = (tId, username, description) => ajax(BASE + '/admin/tag', {tId, username, description}, 'POST')

//admin更新tag
export const reqUpdateTag = (id, tId, description) => ajax(BASE + '/admin/tag', {id, tId, description}, 'PUT')

//admin删除tag
export const reqDeleteTag = (id) => ajax(BASE + '/admin/tag', {id}, 'DELETE')

//user获得tag
export const reqUserTags = () => ajax(BASE + '/tag')

//user添加tag
export const reqUserAddTag = (tId, description) => ajax(BASE + '/tag', {tId, description}, 'POST')

//user更新tag
export const reqUserUpdateTag = (id, tId, description) => ajax(BASE + '/tag', {id, tId, description}, 'PUT')

//user删除tag
export const reqUserDeleteTag = (id) => ajax(BASE + '/tag', {id}, 'DELETE')

/*
   user类api
*/

//admin获得user
export const reqUsers = () => ajax(BASE + '/admin/user')

//admin添加user
export const reqAddUser = (username, email, password) => ajax(BASE + '/admin/user', {username, email, password}, 'POST')

//admin更新user用户
export const reqUpdateUser = (id, username, email) => ajax(BASE + '/admin/user', {id, username, email}, 'PUT')

//admin更新user密码
// export const reqUpdateUserPassword = (id, password) => ajax(BASE + '/admin/user', {id, password}, 'PUT')

//admin删除user
export const reqDeleteUser = (id) => ajax(BASE + '/admin/user', {id}, 'DELETE')
