// hooks/useIdleLogout.js
import { useEffect } from "react";
import { useStaffstore } from "../Store/staffStore";

export const useIdleLogout = (timeout = 10 * 60 * 1000) => {
  const { logout } = useStaffstore(); // ✅ call the hook

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout(); // works now
        window.location.href = "/"; // redirect to login page
      }, timeout);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start timer

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [logout, timeout]);
};
