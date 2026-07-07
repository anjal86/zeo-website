"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Link as LinkIcon, Mail, Check } from 'lucide-react';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface SocialShareProps {
  url: string;
  title: string;
  layout?: 'row' | 'grid';
}

const resolveShareUrl = (inputUrl: string) => {
  if (typeof window === 'undefined') return inputUrl;
  try {
    const parsed = new URL(inputUrl, window.location.origin);
    return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return window.location.href;
  }
};

const SocialShare: React.FC<SocialShareProps> = ({ url, title, layout = 'grid' }) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url);

  useEffect(() => {
    setShareUrl(resolveShareUrl(url));
  }, [url]);

  const shareLinks = useMemo(() => [
    {
      name: 'Facebook',
      icon: FaFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#1877F2] hover:text-white text-[#1877F2]'
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
      color: 'hover:bg-[#1DA1F2] hover:text-white text-[#1DA1F2]'
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
      color: 'hover:bg-[#0A66C2] hover:text-white text-[#0A66C2]'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`,
      color: 'hover:bg-[#25D366] hover:text-white text-[#25D366]'
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent('Check this out: ' + shareUrl)}`,
      color: 'hover:bg-gray-700 hover:text-white text-gray-600'
    }
  ], [shareUrl, title]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = shareUrl;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail — clipboard blocked in some iframe contexts
    }
  };

  if (layout === 'row') {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-gray-500">Share:</span>
        {shareLinks.map(link => (
          <motion.a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            className={`p-2 rounded-full border border-gray-200 bg-white transition-all duration-200 ${link.color}`}
            aria-label={`Share on ${link.name}`}
          >
            <link.icon className="w-4 h-4" />
          </motion.a>
        ))}
        <motion.button
          onClick={handleCopyLink}
          whileHover={{ y: -2 }}
          className={`p-2 rounded-full border border-gray-200 bg-white transition-all duration-200 ${
            copied ? 'bg-green-500 text-white border-green-500' : 'text-gray-600 hover:bg-gray-700 hover:text-white'
          }`}
          aria-label={copied ? 'Copied!' : 'Copy link'}
        >
          {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
        </motion.button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {shareLinks.map(link => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 bg-white py-3 rounded-2xl border border-slate-200 transition-all font-bold text-sm ${link.color}`}
            aria-label={`Share on ${link.name}`}
          >
            <link.icon className="w-4 h-4" />
            {link.name}
          </a>
        ))}
      </div>
      <button
        onClick={handleCopyLink}
        className={`w-full flex items-center justify-center gap-2 py-3 border rounded-2xl font-bold text-sm transition-all duration-200 ${
          copied
            ? 'bg-green-500 text-white border-green-500'
            : 'bg-white border-slate-200 text-gray-600 hover:bg-gray-700 hover:text-white'
        }`}
      >
        {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><LinkIcon className="w-4 h-4" /> Copy Link</>}
      </button>
    </div>
  );
};

export default SocialShare;
