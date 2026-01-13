const datasource = require("./datasource");
const cache = require("../../utils/cache");

exports.fetchInstagramData = async () => {
  try {
    const data = (await datasource.fetchInstagramProfile()).data;

    const result = {
      username: data.user.username,
      followers: data.user.edge_followed_by.count,
      following: data.user.edge_follow.count,
      posts: data.user.edge_owner_to_timeline_media.count,
      lastUpdate: new Date().toISOString(),
    };

    cache.set(result, "instagram.json");

    return result;
  } catch (error) {
    console.error("Error in fetchInstagramData:", error);
    return cache.get("instagram.json");
  }
};
