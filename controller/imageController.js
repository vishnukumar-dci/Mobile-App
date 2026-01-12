const cloudinary = require("../config/cloudinary");

exports.generateImage = async (req, res) => {
  try {
    const prompt = req.body?.prompt;

    if (!prompt) {
      return res.status(400).json({
        message: "Please give any prompt",
        statusCode: 400,
        success: false,
        data: {},
      });
    }

    const response = await fetch(
      "https://api.freepik.com/v1/ai/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-freepik-api-key": process.env.FREEPIK_API_KEY,
        },
        body: JSON.stringify({
          prompt,
          width: 1024,
          height: 1024,
        }),
      }
    );

    const result = await response.json();

    if (!result?.data?.[0]?.base64) {
      return res.status(500).json({ message: "Image not generated" });
    }

    const base64Image = `data:image/png;base64,${result.data[0].base64}`;

    const uploadedImage = await cloudinary.uploader.upload(base64Image, {
      folder: "Images/AI",
      transformation: [
        {
          width: 500,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Image generated & uploaded successfully",
      data: {
        url: uploadedImage.secure_url,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image generation failed" });
  }
};
