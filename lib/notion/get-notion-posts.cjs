const { getPosts } = require("./client.cjs");
const { NotionToMarkdown } = require("notion-to-md");
const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

getPosts(10).then((posts) => {
	const notion = new Client({
		auth: process.env.NOTION_API_KEY,
	});

	const n2m = new NotionToMarkdown({ notionClient: notion });

	// Loop posts and log in console the title of every post
	for (const post of posts) {
		n2m
			.pageToMarkdown(post.PageId)
			.then((mdblocks) => {
				let mdString = n2m.toMarkdownString(mdblocks);
				mdString = mdString.replace(/^\s*\n/, ""); // remove empty first line

				// Convert the tags property to an array
				const tags = Array.isArray(post.Tags) ? post.Tags : [post.Tags];

				console.log(post.Title);
				console.log(post.Description);

				// Add frontmatter properties to the beginning of the markdown content
				const frontmatter = [
					`---`,
					`title: ${post.Title}`,
					`description: ${post.Description}`,
					`thumbnail: ${post.Thumbnail}`,
					`publishDate: ${JSON.stringify(post.PublishDate)}`,
					`tags: ${JSON.stringify(tags)}`,
					`---`,
					``,
				].join("\n");

				mdString = `${frontmatter}${mdString}`;

				let mdFileName = path.join(process.cwd(), "src/content/post", post.Title + ".md");

				if (fs.existsSync(mdFileName)) {
					const oldMdString = fs.readFileSync(mdFileName, "utf8");
					if (oldMdString === mdString) {
						console.log("File already exists and has the same content: " + mdFileName);
					} else {
						fs.unlinkSync(mdFileName);
						fs.writeFileSync(mdFileName, mdString);
						console.log("File updated successfully! " + mdFileName);
					}
				} else {
					fs.writeFileSync(mdFileName, mdString);
					console.log("File written successfully! " + mdFileName);
				}
			})
			.catch((err) => console.log(err));
	}
});
