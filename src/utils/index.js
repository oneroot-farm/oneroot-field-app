import dayjs from "dayjs";
import Cookies from "js-cookie";

export const getUserAgent = () => {
  const { appName, appVersion, platform } = navigator;

  const browserName = appName;
  const browserVersion = appVersion;
  const os = platform;

  return {
    os: os,
    browser: `${browserName} ${browserVersion}`,
    details: `${os} ${browserName} ${browserVersion}`,
  };
};

export const getUserToken = () => {
  const user = Cookies.get("user");

  const parsedUser = JSON.parse(user);

  if (user && user !== undefined && user !== null) return parsedUser.token;

  return undefined;
};

export const uploadImagesHandler = async (files, folder) => {
  if (!Array.isArray(files) || files.length === 0) return [];

  const path = `${process.env.NEXT_PUBLIC_BASE_URL}/file/upload/${folder}`;

  const promises = files.map(async (file) => {
    const form = new FormData();

    const extension = file.name.split(".").pop();

    const name = file.name + "-" + Date.now() + "." + extension;

    const payload = {
      file,
      name,
      type: `image/${extension}`,
    };

    form.append("file", payload);

    try {
      const response = await fetch(path, {
        body: form,
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        const json = await response.json();

        return json.url;
      }
    } catch (error) {
      console.log("Error : ", error.message);
    }
  });

  const urls = await Promise.all(promises);

  const validUrls = urls.filter((url) => url !== null);

  return validUrls;
};

export const isRTKResponse = (error) => {
  return (
    typeof error === "object" &&
    error != null &&
    "status" in error &&
    typeof error.status === "number"
  );
};

export const formatDate = (date) => {
  const result = dayjs(date).format("DD/MM/YYYY");

  return result;
};

export const formatTime = (date) => {
  const result = dayjs(date).format("HH:mm:ss");

  return result;
};

export const capitalizeString = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const isApiResponse = (error) => {
  return (
    typeof error === "object" &&
    error != null &&
    "status" in error &&
    typeof error.status === "number"
  );
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};
