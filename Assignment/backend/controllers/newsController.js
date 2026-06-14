import News from "../models/News.js";
import fs from "fs";
import path from "path";

export const addNews = async (req, res) => {
  try {
    const news = await News.create({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || "draft", // 🔥 ADD THIS
      image: req.file ? `uploads/${req.file.filename}` : ""
    });

    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    if (news.image) {
      const filePath = path.join(process.cwd(), news.image);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await News.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status
    };

    if (req.file) {
      if (news.image) {
        const oldPath = path.join(process.cwd(), news.image);

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      updateData.image = `uploads/${req.file.filename}`;
    }

    const updated = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};