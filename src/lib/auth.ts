export const getCurrentUser = () => {
  const rawId = localStorage.getItem('tecnova_userId') || '';
  const cleanId = rawId ? rawId.replace(/['"]/g, '').trim() : '';
  const rawName = localStorage.getItem('tecnova_userName') || '';
  const cleanName = rawName ? rawName.replace(/['"]/g, '').replace('undefined undefined', '').trim() : '';
  const rawRole = localStorage.getItem('tecnova_userRole') || '';
  const cleanRole = rawRole ? rawRole.replace(/[{}"\\]/g, '').trim() : '';

  return {
    id: cleanId,
    name: cleanName,
    role: cleanRole
  };
};
