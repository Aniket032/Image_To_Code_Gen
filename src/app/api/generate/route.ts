export const maxDuration = 45;
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { generateRequestSchema } from "./schema";

export async function POST(req: Request) {
  const {
    imageUrl,
    version,
    generatedImageURL,
  }: {
    imageUrl: string;
    version: number;
    generatedImageURL?: string;
  } = await req.json();

  const systemPrompt: string = `You are an expert UI developer. Analyze the image at the provided URL and generate HTML and Tailwind CSS that replicates the layout and style. The code should closely match the visual structure, colors, and dimensions seen in the image.
    ${
      version > 1
        ? "This is iteration " +
          version +
          `. Focus on improving accuracy and addressing any discrepancies .`
        : ""
    }
    Image URL: ${imageUrl} ${
    version > 1
      ? ` and here's the newly generated image: ${generatedImageURL}`
      : ""
  }
    Output only the HTML and Tailwind CSS code necessary to recreate the design in the image without any explanation.
    Points to keep in mind :
	- Think of it if you are typing this code in your code editor.
    - make sure all the tags are closed properly.
	- This is pure HTML with Tailwind implemented so make sure everything is there in the html
	- Add everything related to HTML so that it works straight away in the .html file
	- Since this is stringified later on so don't add new lines and indentation in the code so that it doesn't contain any extra symbols
	- Also Try to calculate the accuracy of the code based on similarity from the ${generatedImageURL} and if there's no generatedImageURL the accuracy will be zero  improve it in the next iteration.
    `;

  const result = await streamObject({
    model: openai("gpt-4o-mini"),
    schema: generateRequestSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: systemPrompt,
          },
          {
            type: "image",
            image: new URL(imageUrl),
          },
        ],
      },
    ],
  });

  const output = result.toTextStreamResponse();
  return output;
}
