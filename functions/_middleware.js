// این فایل به کلودفلر می‌فهماند که پروژه دارای بخش Functions است
export async function onRequest(context) {
  return await context.next();
}
