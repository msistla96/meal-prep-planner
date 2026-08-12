import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

type RouterState = {
  path: string;
  navigate: (path: string, options?: { replace?: boolean }) => void;
};

const RouterContext = createContext<RouterState | undefined>(undefined);

function normalizePath(path: string) {
  if (!path || path === "") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const handlePop = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const value = useMemo<RouterState>(
    () => ({
      path,
      navigate: (nextPath: string, options?: { replace?: boolean }) => {
        const normalized = normalizePath(nextPath);
        if (options?.replace) {
          window.history.replaceState({}, "", normalized);
        } else {
          window.history.pushState({}, "", normalized);
        }
        setPath(normalized);
      }
    }),
    [path]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used inside RouterProvider");
  }
  return context;
}

export function AppLink({
  to,
  className,
  activeClassName,
  children,
  end = false,
  replace = false
}: {
  to: string;
  className?: string;
  activeClassName?: string;
  children: ReactNode;
  end?: boolean;
  replace?: boolean;
}) {
  const { path, navigate } = useRouter();
  const active = end ? path === to : path === to || path.startsWith(`${to}/`);
  const classes = [className, active && activeClassName].filter(Boolean).join(" ");

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    navigate(to, { replace });
  }

  return (
    <a href={to} className={classes} onClick={handleClick}>
      {children}
    </a>
  );
}
