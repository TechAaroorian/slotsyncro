"use client";

import { useActionState } from "react";
import { createPoll } from "@/app/actions/poll";
import { PollFormState } from "@/lib/schemas/poll";

const initialState: PollFormState = {};

export function CreatePollForm() {
  const [state, formAction, isPending] = useActionState(
    createPoll,
    initialState,
  );

  const defaultHours = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  return (
    <form action={formAction} className="space-y-5">
      {/* General Form Error */}
      {state.errors?.formError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400 font-medium">
          {state.errors.formError[0]}
        </div>
      )}

      {/* Poll Title Field */}
      <div>
        <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 tracking-wider mb-2">
          Poll Title *
        </label>
        <input
          type="text"
          name="title"
          placeholder="e.g., Sprint Planning or Product Design Review"
          className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all"
        />
        {state.errors?.title && (
          <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5">
            {state.errors.title[0]}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 tracking-wider mb-2">
          Description (Optional)
        </label>
        <textarea
          name="description"
          rows={2}
          placeholder="Add meeting context..."
          className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all resize-none"
        />
        {state.errors?.description && (
          <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {/* Meeting Date Field */}
      <div>
        <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 tracking-wider mb-2">
          Meeting Date *
        </label>
        <input
          type="date"
          name="slotDate"
          defaultValue={new Date().toISOString().split("T")[0]}
          className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all [color-scheme:light] dark:[color-scheme:dark]"
        />
        {state.errors?.slotDate && (
          <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5">
            {state.errors.slotDate[0]}
          </p>
        )}
      </div>

      {/* Time Slots Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 tracking-wider mb-2">
          Select Available Time Slots (1-hour slots) *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {defaultHours.map((hour) => (
            <label
              key={hour}
              className="flex items-center space-x-2 p-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                name="startHours"
                value={hour}
                className="w-4 h-4 text-gray-900 dark:text-white rounded focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {hour}
              </span>
            </label>
          ))}
        </div>
        {state.errors?.startHours && (
          <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5">
            {state.errors.startHours[0]}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-medium text-sm rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all shadow-md active:scale-95"
      >
        {isPending ? "Creating Poll..." : "Create Poll & Share Link 🚀"}
      </button>
    </form>
  );
}
