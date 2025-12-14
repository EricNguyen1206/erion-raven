import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div>
      <div
        className="w-[100%] text-black dark:text-black bg-white dark:bg-white
                      flex gap-10 justify-center flex-wrap-reverse mx-auto py-[100px] px-4"
      >
        <div className="flex flex-col gap-5">
          <p className="text-[30px] md:text-[50px] font-medium text-chat-primary">
            WRONG TURN?
          </p>
          <p className="text-justify md:max-w-[600px] font-normal">
            You look lost, stranger. You know what helps when you're lost? A
            piping hot bowl of noodles. Take a seat, we're frantically at work
            here cooking up something good. Oh, you need something to read?
            These might help you:
          </p>
          <div className="flex flex-col gap-1">
            <Link to={"https://discordstatus.com"}>
              <p className="text-[20px] text-chat-accent hover:text-chat-primary font-normal">
                Status Page
              </p>
            </Link>
            <Link to={"https://twitter.com/discord"}>
              <p className="text-[20px] text-blue-400 hover:text-blue-500">
                @Discord
              </p>
            </Link>
            <Link to={"https://support.discord.com/hc/en-us"}>
              <p className="text-[20px] text-blue-400 hover:text-blue-500">
                Discord Support
              </p>
            </Link>
          </div>
        </div>
        <img
          src="/images/not-found-hero.png"
          width={350}
          height={350}
          alt="notfound"
        />
      </div>
    </div>
  );
};

export default NotFoundPage;
