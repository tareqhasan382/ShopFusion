"use client";
import { BASEURL } from "@lib/config";
import { useEffect, useState } from "react";
import { MailOpen, Mail, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import FormateDate from "@/components/FormateDate";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchMessages = async (unreadOnly) => {
    setLoading(true);
    try {
      const result = await fetch(`${BASEURL}/api/contact${unreadOnly ? "?unread=true" : ""}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setMessages(data.data || []);
      setUnread(data.unread || 0);
    } catch {
      toast.error("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(showUnreadOnly);
  }, [showUnreadOnly]);

  const markRead = async (messageId, isRead) => {
    setBusyId(messageId);
    try {
      const result = await fetch(`${BASEURL}/api/contact/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to update message.");
      fetchMessages(showUnreadOnly);
    } catch {
      toast.error("Failed to update message.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    setBusyId(messageId);
    try {
      const result = await fetch(`${BASEURL}/api/contact/${messageId}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to delete message.");
      toast.success("Message deleted.");
      fetchMessages(showUnreadOnly);
    } catch {
      toast.error("Failed to delete message.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowUnreadOnly((prev) => !prev)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            showUnreadOnly
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Unread only ({unread})
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-16 text-center text-slate-500">No messages found.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`rounded-xl border bg-white p-5 transition-colors ${
                message.isRead ? "border-slate-200" : "border-indigo-200 bg-indigo-50/40"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{message.name}</p>
                    {!message.isRead && (
                      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{message.email}</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{message.subject}</p>
                  <p className="mt-2 text-sm text-slate-600">{message.message}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    <FormateDate date={message.createdAt} />
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markRead(message._id, !message.isRead)}
                    disabled={busyId === message._id}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50"
                    aria-label={message.isRead ? "Mark as unread" : "Mark as read"}
                    title={message.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {busyId === message._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : message.isRead ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <MailOpen className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(message._id)}
                    disabled={busyId === message._id}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                    aria-label="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;
