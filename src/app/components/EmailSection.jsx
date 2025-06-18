"use client";
import React, { useState, useEffect } from "react";
import GithubIcon from "../../../public/github-icon.svg";
import LinkedinIcon from "../../../public/linkedin-icon.svg";
import Link from "next/link";
import Image from "next/image";

const EmailSection = () => {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Turnstile callback fonksiyonları (global olması gerekiyor)
  useEffect(() => {
    window.onTurnstileCallback = (token) => {
      setTurnstileToken(token);
      console.log('Turnstile token received:', token);
    };

    window.onTurnstileError = () => {
      setTurnstileToken('');
      setStatus('Güvenlik doğrulaması hatası');
      console.log('Turnstile error');
    };

    window.onTurnstileExpired = () => {
      setTurnstileToken('');
      setStatus('Güvenlik doğrulaması süresi doldu');
      console.log('Turnstile expired');
    };

    return () => {
      // Cleanup global functions
      delete window.onTurnstileCallback;
      delete window.onTurnstileError;
      delete window.onTurnstileExpired;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');

    // Turnstile kontrolü
    if (!turnstileToken) {
      setStatus('Lütfen güvenlik doğrulamasını tamamlayın');
      setIsLoading(false);
      return;
    }

    const data = {
      email: e.target.email.value,
      subject: e.target.subject.value,
      message: e.target.message.value,
      turnstileToken: turnstileToken,
    };

    const JSONdata = JSON.stringify(data);
    const endpoint = "/api/send";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSONdata,
    };

    try {
      const response = await fetch(endpoint, options);
      const resData = await response.json();

      if (response.status === 200) {
        console.log("Message sent.");
        setEmailSubmitted(true);
        setStatus('Mesajınız başarıyla gönderildi!');
        
        // Form'u temizle
        e.target.reset();
        setTurnstileToken('');
        
        // Turnstile'ı reset et
        if (window.turnstile) {
          window.turnstile.reset();
        }
      } else {
        setStatus(resData.error || 'Bir hata oluştu');
      }
    } catch (error) {
      setStatus('Ağ hatası oluştu');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="grid md:grid-cols-2 my-12 md:my-12 py-24 gap-4 relative"
    >
      <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 to-transparent rounded-full h-80 w-80 z-0 blur-lg absolute top-3/4 -left-4 transform -translate-x-1/2 -translate-1/2"></div>
      <div className="z-10">
        <h5 className="text-xl font-bold text-white my-2">
          Let&apos;s Connect
        </h5>
        <p className="text-[#ADB7BE] mb-4 max-w-md">
          {" "}
          I&apos;m currently looking for new opportunities, my inbox is always
          open. Whether you have a question or just want to say hi, I&apos;ll
          try my best to get back to you!
        </p>
        <div className="socials flex flex-row gap-2">
          <Link href="https://github.com/akaemir">
            <Image src={GithubIcon} alt="Github Icon" />
          </Link>
          <Link href="https://linkedin.com/in/emirhan-celik">
            <Image src={LinkedinIcon} alt="Linkedin Icon" />
          </Link>
        </div>
      </div>
      <div>
        {emailSubmitted ? (
          <div className="text-center">
            <p className="text-green-500 text-lg font-medium">
              Email sent successfully!
            </p>
            <button
              onClick={() => {
                setEmailSubmitted(false);
                setStatus('');
              }}
              className="mt-4 text-blue-400 hover:text-blue-300 underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="text-white block mb-2 text-sm font-medium"
              >
                Your email
              </label>
              <input
                name="email"
                type="email"
                id="email"
                required
                className="bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 text-sm rounded-lg block w-full p-2.5"
                placeholder="jacob@google.com"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="subject"
                className="text-white block text-sm mb-2 font-medium"
              >
                Subject
              </label>
              <input
                name="subject"
                type="text"
                id="subject"
                required
                className="bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 text-sm rounded-lg block w-full p-2.5"
                placeholder="Just saying hi"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="message"
                className="text-white block text-sm mb-2 font-medium"
              >
                Message
              </label>
              <textarea
                name="message"
                id="message"
                required
                className="bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 text-sm rounded-lg block w-full p-2.5 h-32"
                placeholder="Let's talk about..."
              />
            </div>
            
            {/* Turnstile Widget */}
            <div className="mb-6 flex justify-center">
              <div
                className="cf-turnstile"
                data-sitekey={process.env.PUBLIC_CF_TURNSTILE_SITE_KEY}
                data-theme="dark"
                data-size="normal"
                data-callback="onTurnstileCallback"
                data-error-callback="onTurnstileError"
                data-expired-callback="onTurnstileExpired"
              ></div>
            </div>

            {/* Status mesajı */}
            {status && (
              <div className={`mb-4 p-3 rounded-lg text-center ${
                status.includes('başarıyla') || status.includes('successfully')
                  ? 'bg-green-900/20 text-green-400 border border-green-400/20'
                  : 'bg-red-900/20 text-red-400 border border-red-400/20'
              }`}>
                {status}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !turnstileToken}
              className={`font-medium py-2.5 px-5 rounded-lg w-full transition-colors ${
                isLoading || !turnstileToken
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-blue-500 hover:bg-green-600 text-white'
              }`}
            >
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default EmailSection;