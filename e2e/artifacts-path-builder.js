module.exports = ({ rootDir }) => {
  const date = new Date();
  const timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}-${String(date.getSeconds()).padStart(2, '0')}`;
  
  return {
    pathForTestArtifact: (artifactName, testSummary) => {
      const suiteName = testSummary.ancestorTitles.join('/').replace(/ /g, '_');
      const testName = testSummary.title.replace(/ /g, '_');
      const platform = device.getPlatform();
      const status = testSummary.status;
      
      return `${rootDir}/${platform}/${timestamp}/${suiteName}/${testName}/${status}/${artifactName}`;
    },
  };
};