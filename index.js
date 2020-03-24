// Imports the Google Cloud client libraries
const vision = require('@google-cloud/vision').v1;
const {Storage} = require('@google-cloud/storage');
const fs = require('fs');

// Creates a client
const client = new vision.ImageAnnotatorClient();
// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// Import other required libraries
//const fs = require('fs');
const util = require('util');
// Creates a client1
const client1 = new textToSpeech.TextToSpeechClient();
/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// Bucket where the file resides
const bucketName = 'ultra-brand-234514-vcm'
// Path to PDF file within bucket
 const fileName = 'maalm.pdf';
// The folder to store the results
 const outputPrefix = '/result'

const gcsSourceUri = `gs://${bucketName}/${fileName}`;
const gcsDestinationUri = `gs://${bucketName}/${outputPrefix}/`;

const inputConfig = {
  // Supported mime_types are: 'application/pdf' and 'image/tiff'
  mimeType: 'application/pdf',
  gcsSource: {
    uri: gcsSourceUri,
  },
};
const outputConfig = {
  gcsDestination: {
    uri: gcsDestinationUri,
  },
};
const features = [{type: 'DOCUMENT_TEXT_DETECTION'}];
const request = {
  requests: [
    {
      inputConfig: inputConfig,
      features: features,
      outputConfig: outputConfig,
    },
  ],
};
//test002();
async function test002(){
const [operation] = await client.asyncBatchAnnotateFiles(request);
const [filesResponse] = await operation.promise();
const destinationUri ='test.json'
  filesResponse.responses[0].outputConfig.gcsDestination.uri;
//console.log('Json saved to: ' + destinationUri);

}


const path = require('path');
const cwd = path.join(__dirname, '..');

function main(
  bucketName = 'ultra-brand-234514-vcm',
  srcFilename = 'result//output-1-to-1.json',
  destFilename = path.join(cwd, 'downloaded.txt')
) {

  
  // Creates a client
  const storage = new Storage();

  async function downloadFile(srcFname) {
    const options = {
      // The path to which the file should be downloaded, e.g. "./file.txt"
      destination: destFilename,
    };

    // Downloads the file
    await storage
      .bucket(bucketName)
      .file(srcFname)
      .download(options);

    console.log(
      `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
    );
  }
  async function listFiles() {
    // Lists files in the bucket
  /*  const [files] = await storage.bucket(bucketName).getFiles();

    console.log('Files:');
    files.forEach(file => {
		if(file.name.match(/result[A-z,//]+/g)){
		console.log(file.name);
		downloadFile(file.name).catch(console.error);
		}
      
    });*/
	let rawdata = fs.readFileSync('../downloaded.txt');
	let outputtxt = JSON.parse(rawdata);
	var txt =outputtxt.responses[0].fullTextAnnotation.text;
	console.log(txt);
	quickStart(txt)
  }

  listFiles().catch(console.error);

}
//main(...process.argv.slice(2));

async function fileTovoice(){
	for (var i =1; i<11; i++){
		let rawdata = fs.readFileSync('../'+i+'.json');
	let outputtxt = JSON.parse(rawdata);
	var txt =''
	for (var x in outputtxt.responses){
		if(outputtxt.hasOwnProperty('responses') && outputtxt.responses[x].hasOwnProperty('fullTextAnnotation'))
	txt=outputtxt.responses[x].fullTextAnnotation.text;
	
	console.log(txt);
	await quickStart(txt,i*100+x)}
}}
fileTovoice()


async function quickStart(text,i) {

  // The text to synthesize
  // text = 'hello, world!';

  // Construct the request
  const request = {
    input: {text: text},
    // Select the language and SSML voice gender (optional)
    voice: {languageCode: 'ar-EG', ssmlGender: 'NEUTRAL'},
    // select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3'},
  };

  // Performs the text-to-speech request
  const [response] = await client1.synthesizeSpeech(request);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(i+'.mp3', response.audioContent, 'binary');
  console.log('Audio content written to file: output.mp3');
}

