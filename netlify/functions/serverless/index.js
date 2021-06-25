const { builder } = require("@netlify/functions");
const { EleventyServerless } = require("@11ty/eleventy");

// For the bundler, generated by the serverless plugin
require("./eleventy-bundler-modules.js");

const precompiledCollections = require("./_generated-serverless-collections.json");

async function handler (event) {
	let elev = new EleventyServerless("serverless", {
		path: event.path,
		query: event.queryStringParameters,
		inputDir: "src",
		functionsDir: "netlify/functions/",
		precompiledCollections
	});

	try {
		return {
			statusCode: 200,
			headers: {
				"Content-Type": "text/html; charset=UTF-8"
			},
			body: await elev.render()
		};
	} catch (error) {
		// Only console log for matching serverless paths
		// (otherwise you’ll see a bunch of BrowserSync 404s for non-dynamic URLs during --serve)
		if(elev.isServerlessUrl(event.path)) {
			console.log("Dynamic render error:", error);
		}

		return {
			statusCode: error.httpStatusCode || 500,
			body: JSON.stringify({
				error: error.message
			}, null, 2)
		};
	}
}

// Netlify Function
// exports.handler = handler;

// Netlify On-demand Builder
exports.handler = builder(handler);
