export const getCurrentUser = () => ({
  id: localStorage.getItem('nexora_userId') || '',
  name: localStorage.getItem('nexora_userName') || '',
  role: localStorage.getItem('nexora_userRole') || ''
});
