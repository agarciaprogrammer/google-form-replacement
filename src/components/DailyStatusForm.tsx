"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import logo from "@/img/logo.png";


type Activity = "Working Day" | "Vacation" | "Sick Leave";
type Location = "Caesarea" | "Kyiv Office" | "Ramat-Gan" | "Home";

export default function DailyStatusForm() {
  const [email, setEmail] = useState("");
  const [activity, setActivity] = useState<Activity | "">("");
  const [location, setLocation] = useState<Location | "">("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [response, setResponse] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");


  const projects = [
    "SyncME (Android)",
    "SyncME (iPhone/iOS)",
    "SyncME (Website)",
    "Drupe (Android)",
    "Calendar (Android)",
    "Calendar (iPhone/iOS)",
    "Caller ID (Android)",
    "CallsAI (Android)",
    "Call Blocker (Android)",
    "SDK Development (Android)",
    "PowerLead Service",
    "Monetization",
    "Campaigns",
    "DevOps",
    "LiveCaller iOS",
    "Data (DB)",
    "Office and Administration",
    "Customer Support",
    "I have no tasks for today",
  ];

  function toggleProject(p: string) {
    if (selectedProjects.includes(p)) {
      setSelectedProjects(selectedProjects.filter((x) => x !== p));
    } else if (selectedProjects.length < 3) {
      setSelectedProjects([...selectedProjects, p]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResponse("");
    setStatus("submitting");
  
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          activity,
          location,
          projects: selectedProjects,
        }),
      });
  
      const json = await res.json();
  
      if (json.ok) {
        setResponse("✅ Your status has been submitted successfully!");
        // reset form
        setActivity("");
        setLocation("");
        setSelectedProjects([]);
  
        setStatus("success");
        // Volvé a 'idle' después de una pequeña pausa visual
        setTimeout(() => setStatus("idle"), 1200);
      } else {
        throw new Error(json.error || "Something went wrong");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setResponse("❌ " + msg);
      setStatus("error");
    }
  }
  
  

  // Static date fields
  const date = new Date();
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = 2025;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-lg border border-blue-100"
    >
    {/* Logo */}
    <div className="flex justify-center mb-6">
    <Image
        src={logo}
        alt="Company Logo"
        width={400}
        height={400}
        priority
        />
    </div>

      <h1 className="text-3xl font-bold text-center mb-6 text-sky-500 tracking-tight">
        Daily Status
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 text-gray-800"
      >
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@sync.me"
            className="w-full border border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-100 rounded-lg px-4 py-2 transition-all"
          />
        </div>

        {/* Date info */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Month", value: month },
            { label: "Day", value: day },
            { label: "Year", value: year },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {f.label}
              </label>
              <input
                readOnly
                value={f.value}
                className="w-full border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 text-gray-700"
              />
            </div>
          ))}
        </div>

        {/* Activity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Activity
          </label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as Activity)}
            required
            className="w-full border border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-100 rounded-lg px-4 py-2 transition-all"
          >
            <option value="">Select activity...</option>
            <option>Working Day</option>
            <option>Vacation</option>
            <option>Sick Leave</option>
          </select>
        </div>

        {/* Conditional fields */}
        <AnimatePresence>
          {activity === "Working Day" && (
            <motion.div
              key="working-day-fields"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Location
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Caesarea", "Kyiv Office", "Ramat-Gan", "Home"].map((loc) => (
                    <label
                      key={loc}
                      className={`flex items-center space-x-2 border rounded-lg px-3 py-2 cursor-pointer transition-all ${
                        location === loc
                          ? "border-blue-400 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="location"
                        value={loc}
                        checked={location === loc}
                        onChange={() => setLocation(loc as Location)}
                        required
                        className="text-blue-500 focus:ring-blue-400"
                      />
                      <span>{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Projects for Today (max 3)
                </label>
                <div className="grid grid-cols-2 gap-2 border-gray-200 max-h-60 overflow-y-auto p-2 border rounded-lg">
                  {projects.map((p) => (
                    <label
                      key={p}
                      className={`flex items-center space-x-2 text-sm cursor-pointer ${
                        selectedProjects.includes(p)
                          ? "text-blue-700 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(p)}
                        onChange={() => toggleProject(p)}
                        className="text-blue-500 focus:ring-blue-400"
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          whileHover={status === "idle" ? { scale: 1.03 } : {}}
          whileTap={status === "idle" ? { scale: 0.98 } : {}}
          type="submit"
          disabled={status !== "idle"}
          className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold rounded-lg py-3 shadow-md transition-all cursor-pointer ${
            status !== "idle" ? "opacity-80 cursor-not-allowed" : "hover:shadow-lg"
          }`}
        >
          {status === "submitting" ? (
            // Spinner minimalista
            <motion.div
              className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
          ) : status === "success" ? (
            // Check de éxito
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Submitted
            </span>
          ) : (
            "Submit"
          )}
        </motion.button>
 


        <p className="text-xs text-gray-500 text-center">
          A copy of your responses will be emailed to the address you provided.
        </p>
      </form>

      <AnimatePresence>
        {response && (
          <motion.pre
            key="response"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-800 whitespace-pre-wrap"
          >
            {response}
          </motion.pre>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
