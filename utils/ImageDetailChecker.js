import ollama from "ollama"
import fs from "fs"
import appRootPath from "app-root-path"
export class ImageDetailChecker {

constructor(imagePath){
  this.imagePath = imagePath
}


  async getImageDetail() {
    const prompt = `
Provide a JSON response without wrapping it in triple backticks. Include the following structure and possible values:

[Do not wrap the response in backticks or any other formatting.]


image_quality:
Description: Represents the clarity and detail of the image.
Possible values: "poor", "average", "good", "excellent".

subject_focus:
Description: Determines how sharply the subject is highlighted in the image.
Possible values: "low", "medium", "high".

isCloseEye:
Description: Indicates whether the subject's eyes are closed.
Possible values: true,false
`
  
    const binaryData = fs.readFileSync(this.imagePath)
    const base64EncodedData = Buffer.from(binaryData).toString("base64")
    const response = await ollama.chat({
      model: "llava",
      messages: [
        {
          role: "user",
          content: prompt,
          images: [base64EncodedData],
        },
      ],
    })
    return JSON.parse(response.message.content)
  }
}
