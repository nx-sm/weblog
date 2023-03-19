const { getPosts } = require("./client.cjs");
const { NotionToMarkdown } = require("notion-to-md");
const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const notion = new Client({
	auth: process.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });
const postDir = "src/content/post";

// Sanitize the filename by removing special characters and replacing spaces with dashes
function sanitizeFilename(filename) {
	return filename
		.replace(/[^a-zA-Z0-9-_]/g, "-")
		.replace(/-{2,}/g, "-")
		.toLowerCase();
}

getPosts().then((posts) => {
	// Loop posts and log in console the title of every post
	for (const post of posts) {
		n2m
			.pageToMarkdown(post.PageId)
			.then((mdblocks) => {
				// Convert the Notion blocks to markdown
				let mdString = n2m.toMarkdownString(mdblocks);
				// Remove the first empty line
				mdString = mdString.replace(/^\s*\n/, "");
				// Convert the tags property to an array
				const tags = Array.isArray(post.Tags) ? post.Tags : [post.Tags];
				// Add the ogImage frontmatter property if the post has a thumbnail
				const ogImageFrontmatter = post.Thumbnail ? `ogImage: ${post.Thumbnail}` : "";
				// Add frontmatter properties to the beginning of the markdown content
				const frontmatter = [
					`---`,
					`title: ${post.Title}`,
					`description: ${post.Description}`,
					`thumbnail: ${post.Thumbnail}`,
					`publishDate: ${JSON.stringify(post.PublishDate)}`,
					`tags: ${JSON.stringify(tags)}`,
					`${ogImageFrontmatter}`,
					`---`,
					``,
				].join("\n");
				// Add the frontmatter to the markdown content
				mdString = `${frontmatter}${mdString}`;

				let mdFileName = path.join(process.cwd(), postDir, sanitizeFilename(post.Title) + ".md");
				// Check if the file already exists and has the same content
				// If it does, do nothing and log a message in the console
				// If it doesn't, write the file and log a message in the console
				if (fs.existsSync(mdFileName)) {
					const oldMdString = fs.readFileSync(mdFileName, "utf8");
					if (oldMdString === mdString) {
						console.log("File already exists and has the same content: " + mdFileName);
					} else {
						fs.unlinkSync(mdFileName);
						fs.writeFileSync(mdFileName, mdString, { mode: 0o644 });
						console.log("File updated successfully! " + mdFileName);
					}
				} else {
					fs.writeFileSync(mdFileName, mdString, { mode: 0o644 });
					console.log("File written successfully! " + mdFileName);
				}
			})
			.catch((err) => console.log(err));
	}
});
