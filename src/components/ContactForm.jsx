"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();

    // basic guard
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("Please fill out all fields.");
      return;
    }

    const to = "contact.stickypicky@gmail.com";
    const subject = encodeURIComponent(`Portfolio Inquiry from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );

    // Launch default mail app
    const href = `mailto:${to}?subject=${subject}&body=${body}`;
    window.location.href = href;

    // UX hint if nothing happens
    setStatus(
      "If your email app didn’t open, email me directly at contact.stickypicky@gmail.com."
    );
  }

  return (
    <form
    onSubmit={onSubmit}
    className="card p-8 sm:p-10 space-y-5 flex flex-col min-h-[420px]"
    >

      <input
        name="name"
        value={form.name}
        onChange={onChange}
        required
        placeholder="Your name"
        className="input"
        aria-label="Your name"
      />
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={onChange}
        required
        placeholder="Email"
        className="input"
        aria-label="Your email"
      />
      <textarea
        name="message"
        value={form.message}
        onChange={onChange}
        required
        placeholder="What do you need?"
        rows={5}
        className="input min-h-[140px]"
        aria-label="Your message"
      />
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button type="submit" className="btn-primary">
            Send email
        </button>
        <a
            href="mailto:contact.stickypicky@gmail.com?subject=Portfolio%20Inquiry"
            className="btn-ghost"
        >
            Open email app
        </a>
      </div>

      {status && <p className="text-sm text-muted">{status}</p>}
    </form>
  );
}
