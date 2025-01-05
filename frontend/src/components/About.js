import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-[#0A1122] text-white">
      <div className="container mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold font-serif text-center text-white mb-8">About <span className="text-3xl font-bold font-serif cursor-pointer text-white">
            iNote<span className="text-[#FDC116]">Book</span>
          </span></h1>
        <div className="bg-[#1E3E62] rounded-lg p-8 shadow-lg">
          <p className="text-lg leading-8 mb-6">
            Welcome to iNotebook, a secure and feature-rich platform to manage your notes effortlessly. This web app is powered by React.js, Node.js, Express.js, and MongoDB, showcasing the seamless integration of a modern tech stack. iNotebook is your personal digital notebook, ensuring data security and accessibility wherever you go.
          </p>
          <p className="text-lg leading-8">
            This project was developed as a part of my React.js learning journey, guided by the incredible tutorial series by{' '}
            <a
              href="https://www.codewithharry.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline"
            >
              CodeWithHarry
            </a>.
          </p>
        </div>

        <div className="mt-12 bg-[#1E3E62] rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-[#FF6500] mb-4">About the Developer</h2>
          <p className="text-lg leading-8">
            Hi, I am Prakash Kumar, an enthusiastic full-stack web developer currently pursuing BTech in Computer Science Engineering. Passionate about crafting efficient and user-friendly web solutions, I created iNotebook as a milestone in my journey. This project helped me dive deep into React.js and Node.js, enhancing my understanding of full-stack development.
          </p>
        </div>

        <div className="mt-12 bg-[#1E3E62] rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-[#FF6500] mb-4">Connect with Me</h2>
          <p className="text-lg leading-8 mb-6">
            I am always open to connecting with like-minded developers and exploring new opportunities. Feel free to reach out or follow me on the platforms below:
          </p>
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <a
              href="https://prakashkumar1167.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF6500] hover:bg-opacity-90 text-white px-6 py-2 rounded-md transition-all"
            >
              Portfolio
            </a>
            <a
              href="https://x.com/_akash_raushan"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-600 hover:bg-opacity-90 text-white px-6 py-2 rounded-md transition-all"
            >
              X (Twitter)
            </a>
            <a
              href="https://www.linkedin.com/in/prakashkumar1167/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-700 hover:bg-opacity-90 text-white px-6 py-2 rounded-md transition-all"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/akash-raushan"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-opacity-90 text-white px-6 py-2 rounded-md transition-all"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Inspired by the React.js tutorial by{' '}
            <a
              href="https://www.codewithharry.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF6500] hover:underline"
            >
              CodeWithHarry
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
