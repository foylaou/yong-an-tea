import Error404 from "@/components/helendo/Error404/Error404";

export default function Page() {

    const errorItems = [
        {
            image: "images/error-404/confused.png",
            imageAlt: "看來你來到未知的世界",
            title: "看來你來到未知的世界",
            descInfo: [
                {
                    id: 1,
                    desc: "看來你來到未知的世界，點選「首頁」帶你回家吧~孩子",
                    path: "/",
                    pathText: "首頁"
                }
            ]
        }
    ];

    return (
        <>
            <Error404 errorItems={errorItems} />
        </>
    );
}