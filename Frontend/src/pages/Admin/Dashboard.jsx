'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Elastomech Rubber - Superior Rubber Products</title>
        <meta name="description" content="Elastomech Rubber Company specializes in crafting superior Rubber Fenders and diverse Rubber Products, setting industry standards." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
      </head>

      {/* Hero Section */}
      <section className="bg-gray-50  py-12 lg:py-20">
        <div className="max-w-screen-xl px-6 lg:px-8 mx-auto grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.h1
              className="text-3xl md:text-5xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 mb-6"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              Welcome to Elastomech, You Imagine, We Create
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-gray-900 dark:text-gray-800 leading-relaxed mb-8"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              At Elastomech, we specialize in crafting superior Rubber Fenders and a diverse array of Rubber Products, setting the standard for excellence in the industry.
            </motion.p>
          </div>
          <div className="hidden lg:block lg:col-span-5">
            <motion.img
              src="https://elastomech.in/img/company%20image.jpg"
              alt="Elastomech Products"
              className="w-full h-auto rounded-xl shadow-xl"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
        </div>
      </section>

      {/* Mobile Menu */}
      <div className="lg:hidden px-4 py-3 bg-indigo-600 text-white fixed top-0 w-full z-50 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold">Elastomech</h1>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <Dialog open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
          <Dialog.Panel className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-white font-semibold">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white focus:outline-none"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col space-y-4">
                <a href="/" className="text-gray-300 hover:text-white text-lg">
                  Home
                </a>
                <a href="/products" className="text-gray-300 hover:text-white text-lg">
                  Products
                </a>
                <a href="/about" className="text-gray-300 hover:text-white text-lg">
                  About Us
                </a>
                <a href="/contact" className="text-gray-300 hover:text-white text-lg">
                  Contact Us
                </a>
              </nav>
            </div>
          </Dialog.Panel>
        </Dialog>
      </div>
    </>
  )
}
