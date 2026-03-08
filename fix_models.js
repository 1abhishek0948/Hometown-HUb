const fs = require('fs');

function fixModel(file, replaceTarget, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(replaceTarget, replacement);
  fs.writeFileSync(file, content);
}

fixModel('./src/models/User.ts', /UserSchema\.pre\('save', async function \(this: any, next: any\) \{\n  if \(\!this\.isModified\('password'\)\) return next\(\);\n  this\.password \= await bcrypt\.hash\(this\.password, 12\);\n  next\(\);\n\}\);/g, "UserSchema.pre('save', async function (this: any) {\n  if (!this.isModified('password')) return;\n  this.password = await bcrypt.hash(this.password, 12);\n});");

fixModel('./src/models/Community.ts', /CommunitySchema\.pre\('save', function \(this: any, next: any\) \{\n  this\.memberCount \= this\.members\.length;\n  next\(\);\n\}\);/g, "CommunitySchema.pre('save', function (this: any) {\n  this.memberCount = this.members.length;\n});");

fixModel('./src/models/Post.ts', /PostSchema\.pre\('save', function \(this: any, next: any\) \{\n  this\.likeCount \= this\.likes\.length;\n  next\(\);\n\}\);/g, "PostSchema.pre('save', function (this: any) {\n  this.likeCount = this.likes.length;\n});");

console.log('Fixed models');
