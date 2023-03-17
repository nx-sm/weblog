const { Client } = require("@notionhq/client");

const client = new Client({
	auth: "secret_USlnzy2FRfeYJTwfXYZ0CH67by1uhZeqA65jwlE8Idc",
});

async function getAllPosts() {
	const params = {
		database_id: "75a514fb95974bb6b864f87d70098a0f",
		filter: {
			and: [
				{
					property: "published",
					checkbox: {
						equals: true,
					},
				},
				{
					property: "publishDate",
					date: {
						on_or_before: new Date().toISOString(),
					},
				},
			],
		},
		sorts: [
			{
				property: "publishDate",
				direction: "descending",
			},
		],
		page_size: 100,
	};

	let results = [];
	while (true) {
		const res = await client.databases.query(params);

		results = results.concat(res.results);

		if (!res.has_more) {
			break;
		}

		params["start_cursor"] = res.next_cursor;
	}

	return results
		.filter((pageObject) => _validPageObject(pageObject))
		.map((pageObject) => _getPostProperties(pageObject));
}

async function getPosts(pageSize = 10) {
	const allPosts = await getAllPosts();
	return allPosts.slice(0, pageSize);
}

function _validPageObject(pageObject) {
	const prop = pageObject.properties;
	if (!prop.title) {
		return false;
	}
	return !!prop.title.title && prop.title.title.length > 0;
}

function _getPostProperties(pageObject) {
	const prop = pageObject.properties;
	if (!prop.title || !prop.title.title || prop.title.title.length === 0) {
		return undefined;
	}
	const post = {
		PageId: pageObject.id,
		Title: prop.title.title ? prop.title.title[0].plain_text : "",
		Description: prop.description ? prop.description.rich_text[0].plain_text : "",
		Thumbnail: prop.thumbnail ? prop.thumbnail.files.map((file) => file.name) : "",
		PublishDate: prop.publishDate ? prop.publishDate.date.start : "",
		Tags: prop.tags ? prop.tags.multi_select.map((tag) => tag.name) : [],
	};

	return post;
}

module.exports = {
	getPosts,
};
