const { default: axios } = require("axios");

module.exports = async function (ctx, myTimer) {
  const loginResponse = await axios.post(
    `https://collectpos1.azurewebsites.net/api/login`,
    {
      email: "pcali@hotmail.com",
      password: "51214",
    }
  );

  if (loginResponse.status !== 200) {
    return;
  }

  const { accessToken } = loginResponse.data.data;

  const axiosInstance = axios.create({
    baseURL: `https://collectpos1.azurewebsites.net/api`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  await Promise.all([
    axiosInstance.get(`customer`),
    axiosInstance.get(`category`),
  ]);

  const now = new Date();
  const period = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const id = `${now.getHours()}:${now.getMinutes()}`;
  ctx.bindings.log = JSON.stringify({
    id,
    period,
  });
};
