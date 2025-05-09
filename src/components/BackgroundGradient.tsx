
const BackgroundGradient = () => {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
      <div className="absolute left-[20%] top-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl animate-glow" />
      <div className="absolute right-[20%] bottom-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl animate-glow" />
      <div className="absolute left-0 top-0 h-full w-full bg-black/50" />
    </div>
  );
};

export default BackgroundGradient;
