const imageUpload = document.getElementById('imageUpload')
//to load them async
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)
//run after loading the model and it will create the box witin the face of user with the name on it
async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages() // this function is created below and return the decription and image of uploaded image 
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6) // and it will match the face if accuracy is above 60%
  let image
  let canvas
  //loaded will tell page is finished loading the model
  document.body.append('Loaded')
  //performing face recog. for image 
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0]) // becaise we are uploading only one file so we are taking first element
    container.append(image) // add image in the frontend and then using canvas to draw the boxes
    canvas = faceapi.createCanvasFromMedia(image) // image is converting to canvas
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    //to detect the faces
    console.log("number of face in picture " + detections.length())
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor)) // find best match if more then one image is there of 60%
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
  })
}

function loadLabeledImages() {
  const labels = ['pari'] // get it from database I don't have access to the data base so you can crete the api to get the names 
  return Promise.all(
    // it will traverse to all the labels i.e array with the names (parikshit singh) and check from the place where images are stored
    labels.map(async label => {
      const descriptions = [] // store the decription of image
      for (let i = 1; i <= 2; i++) { // reason for loop to run from 1 to 2 only is that I am useing 2 image for each people to recognize the people more the image more the accuracy
        const img = await faceapi.fetchImage(`/labeled_images/${label}/img${i}.jpg`) // here stored images will get loadeds it will go to label image and look in pari/img1.jpg img2.jpg and so on yahan pe aws s3 bucket ka link dalna host karte samaye
        console.log(`/labeled_images/${label}/img${i}.jpg\n`);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor() // detect the single face to the image  
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions) // return the decription 
    })
  )
}
