const fs = require('fs');
const glob = require('glob');

const files = [
  './src/app/api/posts/[id]/comments/route.ts',
  './src/app/api/posts/[id]/like/route.ts',
  './src/app/api/posts/[id]/route.ts',
  './src/app/api/communities/[slug]/join/route.ts',
  './src/app/api/communities/[slug]/route.ts',
  './src/app/api/users/[id]/route.ts',
  './src/app/api/events/[id]/attend/route.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Replace the signature
  // export async function GET(req: NextRequest, { params }: { params: { id: string } }) { -> export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {\n  const { id } = await context.params;
  content = content.replace(/export async function (\w+)\(req: NextRequest, \{ params \}: \{ params: \{ (\w+): string \} \}\) \{/g, 'export async function $1(req: NextRequest, context: { params: Promise<{ $2: string }> }) {\n  const { $2 } = await context.params;');
  fs.writeFileSync(file, content);
}
console.log('Done');
