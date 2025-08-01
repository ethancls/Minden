import Aurora from "@/components/backgrounds/aurora";

type BackgroundProps = {
    children: React.ReactNode;
};

export function Background({ children }: BackgroundProps) {
    return (
        <>
            <div className="absolute inset-0 -z-10 h-full w-full">
                <Aurora 
                    colorStops={["#8C52FF", "#B57CFF", "#7C4DFF"]}
                    amplitude={1}
                    blend={0.5}
                    speed={0.7}
                />
            </div>
            {children}
        </>
    );
}
