module.exports = {
  dbConnectParams: process.env.OPENSHIFT_MYSQL_DB_URL + process.env.OPENSHIFT_APP_NAME,
  clientId: process.env.OPENSHIFT_NODEJS_PUSHUPOMETER_CLIENTID,
  clientSecret: process.env.OPENSHIFT_NODEJS_PUSHUPOMETER_CLIENTSECRET,
  organization: 'StudyTube'
};
