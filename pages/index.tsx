import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { getLocationData } from "../lib/schedules";
import Calendar from "../components/Calendar";
import styles from "../styles/Home.module.css";

export default function Home({ initialSelectedLocations, locationData }) {
  //console.log("ayy", initialSelectedLocations);
  return (
    <div className={styles.container}>
      <Head>
        <title>SF Hoop Calendar</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Calendar
          initialSelectedLocations={initialSelectedLocations}
          locationData={locationData}
        ></Calendar>

        {/*
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
          <br />
          Read <Link href="/first-post">this page!</Link>
        </h1>
  */}
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/vercel.svg" alt="Vercel" className={styles.logo} />
        </a>
        <a
          href="https://github.com/j13huang/sf-hoop-calendar"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github{" "}
          <img
            src="/github-mark-white.svg"
            alt="Github"
            className={styles.logo}
          />
        </a>
      </footer>
      {/*
      this came from chatgpt and it errors wtf
      <div className="my-component">
        {["yo"].map((item, index) => (
          <p key={index} className="item">
            {item}
            <style jsx>{`
              .item {
                color: red;
                font-size: 20px;
              }
            `}</style>
          </p>
        ))}

        <style jsx>{`
          .my-component {
            background-color: #fafafa;
            padding: 20px;
            border-radius: 5px;
          }
        `}</style>
      </div>
*/}

      <style jsx>{`
        main {
          margin-top: 1rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 600px) {
          main {
            margin-top: 0;
          }
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          background-color: #272727;
          color: #bcbcbc;
        }
        * {
          box-sizing: border-box;
        }
        a {
          color: #7676ff;
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  //console.log(context.req.cookies);
  const locationData = getLocationData();
  let initialSelectedLocations = { "Potrero Hill": true };
  if (context.req.cookies.selectedLocations) {
    //console.log("here?", context.req.cookies.selectedLocations);
    initialSelectedLocations = JSON.parse(
      context.req.cookies.selectedLocations
    );
  }
  //console.log("getServerSideProps", initialSelectedLocations);
  return {
    props: {
      initialSelectedLocations,
      locationData,
    },
  };
};
