import { Book } from "@/app/interfaces/book.interface";
import { useRouter } from "next/navigation";
import ActivityLog from "../ActivityLog/ActivityLog";
import ChangeStatusBadge from "../../ChangeStatusBadge/ChangeStatusBadge";
import TableActions from "../TableActions/TableActions";
import { permission } from "process";
import ConditionalRender from "../../Auth/ConditionalRender/ConditionalRender";
import Image from "next/image";

interface BookTableProps {
  books: Book[];
  onChangeStatus: (id: string, currentStatus: string) => void;
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  setDeleteId: (id: string) => void;
  setEditedBooks: React.Dispatch<React.SetStateAction<Book[]>>;
}

export default function BookTable({
  books,
  onChangeStatus,
  selectedIds,
  onSelect,
  onSelectAll,
  setDeleteId,
  setEditedBooks,
}: BookTableProps) {
  const router = useRouter();
  // Kiểm tra xem đã chọn hết chưa
  const allChecked =
    books.length > 0 &&
    books.every((b) => b._id !== undefined && selectedIds.includes(b._id));

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow">
      <table className="min-w-full">
        <thead>
          <tr className="bg-[#D4E7FC]">
            <th className="py-4 px-4 text-left text-[14.4px]">
              <input
                type="checkbox"
                checked={allChecked}
                className="cursor-pointer"
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              STT
            </th>

            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Sách
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Tác giả
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Thể loại
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Giá
            </th>
            <ConditionalRender permission="edit_book">
              <th className="py-4 px-4 text-left lg:w-[180px] text-[14.4px] font-semibold text-primary">
                Trạng thái
              </th>
            </ConditionalRender>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Vị trí
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Log activity
            </th>
            <th className="py-4 px-4 text-left text-[14.4px] font-semibold text-primary">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, index) => (
            <tr
              key={book.title}
              className="border-t"
              style={{ borderColor: "#64748b33" }}
            >
              <td className="py-4 px-4">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={
                    book._id !== undefined && selectedIds.includes(book._id)
                  }
                  onChange={(e) => {
                    if (book._id !== undefined) {
                      onSelect(book._id, e.target.checked);
                    }
                  }}
                />
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {index + 1}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <Image
                    width={400}
                    height={400}
                    src={book.image || "/book-hive.jpg"}
                    alt={book.title}
                    loading="lazy"
                    className="w-16 h-16 object-cover rounded bg-gray-100"
                  />
                  <span className="text-[16px] max-w-[400px] font-semibold text-primary">
                    {book.title}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {book.author}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {book.category_name}
              </td>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                {book.priceBuy
                  ? book.priceBuy.toLocaleString("vi-VN") + "đ"
                  : "Liên hệ"}
              </td>
              <ConditionalRender permission="edit_book">
                <td className="py-4 px-4">
                  {book._id && (
                    <ChangeStatusBadge
                      status={book.status}
                      onClick={() => {
                        if (book._id) {
                          onChangeStatus(book._id, book.status);
                        }
                      }}
                    />
                  )}
                </td>
              </ConditionalRender>
              <td className="py-4 px-4 text-[14.4px] text-primary">
                <input
                  type="number"
                  min={1}
                  className="w-16 px-2 py-1 border border-gray-300 outline-none focus:ring-2 focus:ring-secondary1 hover:border-secondary1 focus:border-secondary1 transition rounded text-center"
                  value={
                    typeof book.position === "number" && book.position > 0
                      ? book.position
                      : ""
                  }
                  onChange={(e) => {
                    const newPosition = Number(e.target.value);
                    setEditedBooks((prev) =>
                      prev.map((b) =>
                        b._id === book._id
                          ? { ...b, position: newPosition }
                          : b,
                      ),
                    );
                  }}
                />
              </td>
              <td className="py-4 px-4 text-[13px] text-gray-700 ">
                <ActivityLog record={book} />
              </td>
              <td className="py-4 px-4">
                <TableActions
                  actions={[
                    {
                      label: "Chi tiết",
                      title: "detail",
                      permission: "view_books",
                      class:
                        "py-1 px-3 rounded-[6px] text-[13.6px] font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200 cursor-pointer",
                    },
                    {
                      label: "Sửa",
                      title: "edit",
                      permission: "edit_book",
                      class:
                        "xl:py-1 xl:px-3 lg:py-0.5 lg:px-2 rounded-[6px] lg:text-[12px] xl:text-[13.6px] font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer",
                    },
                  ]}
                  permissionDelete="delete_book"
                  source="books"
                  slug={book.slug}
                  id={book._id}
                  onDelete={setDeleteId}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
