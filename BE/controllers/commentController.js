const Comment = require("../models/comments")
const Perfume = require("../models/perfumes")
const Member = require("../models/members")

exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find().populate("author", "name email")
        res.json({ status: true, data: comments })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.createComment = async (req, res) => {
    try {
        const perfumeId = req.params.id || req.body.perfumeId
        const { rating, content } = req.body
        const author = req.member._id // Extracted from auth middleware
        if (!perfumeId || !rating || !content || !author) {
            return res.status(400).json({ status: false, message: "Missing required fields" })
        }

        if (req.member.isAdmin) {
            return res.status(403).json({ status: false, message: "Admin cannot write reviews" })
        }

        const perfume = await Perfume.findById(perfumeId)
        if (!perfume) {
            return res.status(404).json({ status: false, message: "Perfume not found" })
        }
        const existingComment = await Comment.findOne({ _id: { $in: perfume.comments }, author: author })
        if (existingComment) {
            return res.status(400).json({ status: false, message: "You have already reviewed this perfume" })
        }

        const comment = await Comment.create({ rating, content, author })

        await Perfume.findByIdAndUpdate(perfumeId, {
            $push: { comments: comment._id }
        })

        res.status(201).json({ status: true, message: "Comment created successfully", comment })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.updateComment = async (req, res) => {
    try {
        const commentId = req.params.id
        const { rating, content } = req.body
        if (!commentId || !rating || !content) {
            return res.status(400).json({ status: false, message: "Missing required fields" })
        }

        let comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).json({ status: false, message: "Comment not found" })
        }

        if (comment.author.toString() !== req.member._id.toString()) {
            return res.status(403).json({ status: false, message: "You can only edit your own comment" })
        }

        comment.rating = rating;
        comment.content = content;
        await comment.save();

        res.json({ status: true, message: "Comment updated successfully", comment })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).json({ status: false, message: "Comment not found" })
        }

        if (comment.author.toString() !== req.member._id.toString() && !req.member.isAdmin) {
            return res.status(403).json({ status: false, message: "You are not authorized to delete this comment" })
        }

        await Comment.findByIdAndDelete(commentId)

        await Perfume.updateOne(
            { comments: commentId },
            { $pull: { comments: commentId } }
        )

        res.json({ status: true, message: "Comment deleted successfully", comment })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}