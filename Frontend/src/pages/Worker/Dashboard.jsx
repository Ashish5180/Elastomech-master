'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <section className="bg-white dark:bg-white">
      <div className="gap-8 items-center py-8 px-4 mx-auto max-w-screen-xl xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-6">
        {/* Replace SVG with appropriate image alt tags for SEO */}
        <img 
          className="w-full dark:hidden" 
          src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup.svg" 
          alt="Admin Dashboard Preview for Light Mode"
        />
        <img 
          className="w-full hidden dark:block" 
          src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg" 
          alt="Admin Dashboard Preview for Dark Mode"
        />
        <div className="mt-4 md:mt-0">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-black">
           Worker Dashboard.
          </h2>
          <p className="mb-6 font-light text-gray-800 md:text-lg dark:text-gray-900">
            Flowbite helps you connect with friends and communities of people who share your interests. 
            Connecting with your friends and family as well as discovering new ones is easy with features like Groups.
          </p>
          <a 
            href="#" 
            className="inline-flex items-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900"
          >
            Get started
            {/* Replaced SVG with Heroicons arrow icon */}
            <ArrowRightIcon className="ml-2 -mr-1 w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
