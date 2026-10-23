
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Header from "../components/Header";

const CONTACT_NUMBER = "918810628225"; // Replace with your number, including country code
const DISPLAY_NUMBER = "+918810628225"; // Number displayed on the page

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "Product enquiry",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setSubmitted(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setForm(initialForm);
  }

  const whatsappMessage = encodeURIComponent(
    "Hi Purv! I need help with a product or order."
  );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf5] px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#791c2d] transition hover:text-[#ed9b28]"
          >
            <ArrowLeft size={17} />
            Back to shopping
          </Link>

          {/* Compact Contact Page Introduction */}
<section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#421521] via-[#641d32] to-[#8e3544] p-5 text-white shadow-md sm:p-6 lg:p-7">
  <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full border border-white/10" />
  <div className="pointer-events-none absolute -bottom-14 right-32 h-32 w-32 rounded-full border border-[#ffd17a]/15" />

  <div className="relative max-w-2xl">
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[9px] font-bold tracking-[0.15em] sm:text-[10px]">
      <Sparkles size={12} className="text-[#ffd17a]" />
      WE'RE HERE FOR YOU
    </span>

    <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
      Let's make your
      <span className="mt-1 block font-serif italic text-[#ffd17a]">
        Purv experience special.
      </span>
    </h1>

    <p className="mt-2 max-w-xl text-xs leading-6 text-white/80 sm:text-sm">
      Need help with a product, an order, or a thoughtful gift?
      Choose how you would like to connect with our team.
    </p>
  </div>
</section>

          {/* Phone and WhatsApp contact cards */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <a
              href={`tel:+${CONTACT_NUMBER}`}
              className="group flex items-center gap-4 rounded-2xl border border-[#f0e3d9] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#76233a] hover:bg-[#76233a] hover:shadow-lg sm:p-6"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f8e8e5] text-[#76233a] transition-colors duration-300 group-hover:bg-white group-hover:text-[#76233a]">
                <Phone size={25} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-extrabold uppercase tracking-widest text-[#82736f] transition-colors group-hover:text-white/75">
                  Call us
                </span>
                <span className="mt-1 block text-lg font-extrabold text-[#421521] transition-colors group-hover:text-white">
                  {DISPLAY_NUMBER}
                </span>
                <span className="mt-1 block text-xs text-[#82736f] transition-colors group-hover:text-white/80">
                  Speak directly with us
                </span>
              </span>

              <ArrowRight
                size={19}
                className="shrink-0 text-[#76233a] transition-all group-hover:translate-x-1 group-hover:text-white"
              />
            </a>

            <a
              href={`https://wa.me/${CONTACT_NUMBER}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-[#d9eadb] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#25D366] hover:bg-[#128C4A] hover:shadow-lg sm:p-6"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8ed] text-[#168746] transition-colors duration-300 group-hover:bg-white group-hover:text-[#128C4A]">
                <MessageCircle size={26} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-extrabold uppercase tracking-widest text-[#82736f] transition-colors group-hover:text-white/75">
                  WhatsApp us
                </span>
                <span className="mt-1 block text-lg font-extrabold text-[#421521] transition-colors group-hover:text-white">
                  Chat with Purv
                </span>
                <span className="mt-1 block text-xs text-[#82736f] transition-colors group-hover:text-white/80">
                  Message us about your order
                </span>
              </span>

              <ExternalLink
                size={18}
                className="shrink-0 text-[#168746] transition-all group-hover:translate-x-0.5 group-hover:text-white"
              />
            </a>
          </section>

          {/* Contact form */}
          <section className="mt-7 overflow-hidden rounded-3xl border border-[#f0e3d9] bg-white shadow-sm lg:grid lg:grid-cols-[0.75fr_1.25fr]">
            <div className="bg-[#fff2e4] p-6 sm:p-9">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#76233a] shadow-sm">
                <Mail size={23} />
              </span>

              <h2 className="mt-5 text-2xl font-bold text-[#421521] sm:text-3xl">
                Send us a message
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#82736f]">
                Prefer writing to us? Share your question using the form.
                You can ask about products, orders, gifting, or availability.
              </p>

              <div className="mt-6 rounded-2xl border border-[#f0dfcc] bg-white/80 p-4">
                <p className="text-sm font-bold text-[#421521]">
                  How can we help?
                </p>
                <p className="mt-2 text-xs leading-6 text-[#82736f]">
                  Select a topic and tell us a little about what you need.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-9">
              {submitted ? (
                <div
                  role="status"
                  className="flex min-h-[320px] flex-col items-center justify-center text-center"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-green-50 text-green-700">
                    <Send size={28} />
                  </span>

                  <h2 className="mt-5 text-2xl font-bold text-[#421521]">
                    Thank you for reaching out!
                  </h2>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">
                    Your form passed the demo submission step. To deliver
                    messages to your inbox, connect an email service or backend.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 rounded-full bg-[#791c2d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5c1725]"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-[#421521]">
                    Contact our team
                  </h2>
                  <p className="mt-2 text-sm text-stone-500">
                    Fields marked * are required.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-semibold text-[#422b27]">
                        Your name *
                        <input
                          required
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          autoComplete="name"
                          className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fffdfb] px-4 py-3 font-normal outline-none transition focus:border-[#a13a4b] focus:ring-2 focus:ring-[#a13a4b]/10"
                        />
                      </label>

                      <label className="block text-sm font-semibold text-[#422b27]">
                        Email address *
                        <input
                          required
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          autoComplete="email"
                          className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fffdfb] px-4 py-3 font-normal outline-none transition focus:border-[#a13a4b] focus:ring-2 focus:ring-[#a13a4b]/10"
                        />
                      </label>
                    </div>

                    <label className="block text-sm font-semibold text-[#422b27]">
                      Phone number (optional)
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        autoComplete="tel"
                        className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fffdfb] px-4 py-3 font-normal outline-none transition focus:border-[#a13a4b] focus:ring-2 focus:ring-[#a13a4b]/10"
                      />
                    </label>

                    <label className="block text-sm font-semibold text-[#422b27]">
                      What can we help with? *
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fffdfb] px-4 py-3 font-normal outline-none transition focus:border-[#a13a4b]"
                      >
                        <option>Product enquiry</option>
                        <option>Order related</option>
                        <option>Return or replacement</option>
                        <option>Gift recommendation</option>
                        <option>Out-of-stock product</option>
                        <option>Other</option>
                      </select>
                    </label>

                    <label className="block text-sm font-semibold text-[#422b27]">
                      Your message *
                      <textarea
                        required
                        minLength={10}
                        rows={4}
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help..."
                        className="mt-2 w-full resize-y rounded-xl border border-stone-200 bg-[#fffdfb] px-4 py-3 font-normal outline-none transition focus:border-[#a13a4b] focus:ring-2 focus:ring-[#a13a4b]/10"
                      />
                    </label>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#791c2d] px-5 py-3.5 font-semibold text-white transition hover:bg-[#5c1725]"
                    >
                      Send message
                      <ArrowRight size={17} />
                    </button>

                    <p className="text-xs leading-5 text-stone-400">
                      This frontend-only form does not yet send messages to a
                      real inbox. Use the call or WhatsApp options for direct
                      contact once you set your actual number.
                    </p>
                  </form>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
