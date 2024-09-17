import { FaLinkedin, FaGithub } from "react-icons/fa";

const DeveloperPage = () => {
  const developers = [
    {
      name: "John Doe",
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
    },
    {
      name: "Jane Smith",
      linkedin: "https://linkedin.com/in/janesmith",
      github: "https://github.com/janesmith",
    },
  ];

  return (
    <div className="flex justify-center items-center p-8 h-full w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {developers.map((developer, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-6 max-w-sm mx-auto text-center transform transition-transform hover:scale-105"
          >
            <h2 className="text-xl font-bold mb-4">{developer.name}</h2>
            <div className="flex justify-center space-x-4">
              <a
                href={developer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-500"
                title="LinkedIn"
              >
                <FaLinkedin size={30} />
              </a>
              <a
                href={developer.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-gray-600"
                title="GitHub"
              >
                <FaGithub size={30} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeveloperPage;
