const datasource = require("./datasource");
const cache = require("../../utils/cache");

exports.fetchInstagramData = async () => {
  try {
    var result;

    if (process.env.SEARCH_API_APIKEY) {
      const data = await datasource.fetchInstagramProfileWithSearchApi();
      
      result = {
        username: data.profile.username,
        followers: data.profile.followers,
        following: data.profile.following,
        posts: data.profile.posts,
        lastUpdate: new Date().toISOString(),
      };
    } else {
      const data = (await datasource.fetchInstagramProfile()).data;

      result = {
        username: data.user.username,
        followers: data.user.edge_followed_by.count,
        following: data.user.edge_follow.count,
        posts: data.user.edge_owner_to_timeline_media.count,
        lastUpdate: new Date().toISOString(),
      };
    }

    cache.set(result, "instagram.json");

    return result;
  } catch (error) {
    console.error("Error in fetchInstagramData:", error);
    return cache.get("instagram.json");
  }
};
