"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiEdit2 } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ReviewFormProps = {
  bookId: string;
  token: string | null;
  onReviewSubmitted?: (refreshTrigger: number) => void;
  refreshTrigger?: number;
};

export default function ReviewForm({
  bookId,
  token,
  onReviewSubmitted,
  refreshTrigger,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myReview, setMyReview] = useState<any>(null);

  useEffect(() => {
    const fetchMyReview = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/reviews/my-review/${bookId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMyReview(response.data.record || null);
      } catch (error) {
        console.error("Lỗi khi lấy đánh giá của bạn:", error);
        setMyReview(null);
      } finally {
      }
    };

    if (bookId && token) {
      fetchMyReview();
    }
  }, [bookId, token, refreshTrigger]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/reviews/send`,
        {
          bookId: bookId,
          rating: rating,
          comment: reviewText.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(`${response.data.message}`);
      setRating(0);
      setReviewText("");

      onReviewSubmitted?.(Date.now());
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (myReview) {
    return (
      <div className="bg-green-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8 border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-[17.6px] font-semibold text-slate-800">
            Đánh giá của bạn
          </h3>
          <button className="px-4 py-2 cursor-pointer bg-secondary1 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            <FiEdit2 className="inline" /> Sửa
          </button>
        </div>

        <div className="flex gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-base md:text-base ${
                i < myReview.rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              <FaStar />
            </span>
          ))}
        </div>

        <p className="text-slate-700 text-sm md:text-base leading-relaxed">
          {myReview.comment}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
      <h3 className="text-base md:text-[17.6px] font-semibold mb-4 text-slate-800">
        Viết đánh giá của bạn
      </h3>
      <div className="mb-4">
        <label className="block mb-2 text-sm md:text-[14.4px] text-slate-800">
          Đánh giá:
        </label>
        <div className="text-2xl flex gap-[4px]">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`cursor-pointer transition-colors ${
                star <= (hoverRating || rating)
                  ? "text-yellow-400"
                  : "text-[#d1d5db]"
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <FaStar />
            </span>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label
          htmlFor="reviewText"
          className="block mb-2 text-sm md:text-[14.4px] text-slate-800"
        >
          Nhận xét:
        </label>
        <textarea
          id="reviewText"
          rows={4}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn..."
          className="w-full hover:border-secondary1 p-3 border-2 border-slate-200 rounded-lg text-sm md:text-base bg-white text-slate-800 resize-vertical outline-none focus:ring-2 focus:ring-secondary1 focus:border-secondary1 transition duration-200"
        />
      </div>
      <button
        onClick={handleSubmitReview}
        disabled={isSubmitting}
        className="px-6 py-3 bg-secondary1 text-white rounded-lg font-semibold text-sm md:text-base hover:bg-blue-700 cursor-pointer transition-colors duration-200 disabled:opacity-50"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </div>
  );
}
