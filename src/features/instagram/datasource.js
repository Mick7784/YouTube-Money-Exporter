const axios = require("axios");

exports.fetchInstagramProfile = async () => {
  try {
    const username = process.env.INSTAGRAM_USERNAME;
    const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Instagram 76.0.0.15.395 Android (24/7.0; 640dpi; 1440x2560; samsung; SM-G930F; herolte; samsungexynos8890; en_US; 138226743)",
        Accept: "application/json",
        "x-ig-app-id": 936619743392459
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching Instagram profile:", error);
  }
};
