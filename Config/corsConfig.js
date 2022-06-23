const corsConfig = {
  origin: "https://hooked-social.vercel.app",
  credentials: true,
};
 
var whitelist = ['http://localhost:3000', 'https://hooked-social.vercel.app']
var corsConfig = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

export default corsConfig;
