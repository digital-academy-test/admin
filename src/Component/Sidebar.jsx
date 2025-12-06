import React from "react";

const menu = [
  {
    title: "Role Management",
    icon: "./icon/1.PNG",
    pages: [
      {
        pageName: "Add Role",
        pageLink: "/add_role",
      },
      {
        pageName: "Role",
        pageLink: "/role",
      },
    ],
  },
  {
    title: "CBT Management",
    icon: "./icon/8.PNG",
    pages: [
    
       {
        pageName: "Add Subject",
        pageLink: "/add_subject",
      },
       {
        pageName: "Add Topic",
        pageLink: "/add_topic",
      },
        {
        pageName: "Add Question",
        pageLink: "/add_question",
      },
      {
        pageName: "Questions Management",
        pageLink: "/questions",
      },
    ],
  },
    {
    title: "Staff Management",
    icon: "./icon/4.PNG",
    pages: [
      {
        pageName: "Add Staff",
        pageLink: "/add_staff",
      },
      {
        pageName: "Questions Management",
        pageLink: "/questions",
      },
    ],
  },
   {
    title: "Blog Management",
    icon: "./icon/4.PNG",
    pages: [
      {
        pageName: "Add  Blog post",
        pageLink: "/post",
      },
      {
        pageName: "Blog Posts",
        pageLink: "/manage_post",
      },
    ],
  },
  {
    title: "Course Management",
    icon: "./icon/5.PNG",
    pages: [
      {
        pageName: "Start Course",
        pageLink: "/start_course",
      },
      {
        pageName: "Courses",
        pageLink: "/courses",
      },
       {
        pageName: "Manage interests",
        pageLink: "/interests",
      },
    ],
  },
   {
    title: "plan Management",
    icon: "./icon/8.PNG",
    pages: [
      {
        pageName: "plans",
        pageLink: "/plans",
      },
     
    ],
  },
];

function Sidebar() {
  return (
    <ul>
         <li >
          {/* Section Title */}
          <div className=" mb-2 ml-3">
            <a href="/home" className="text-blue-600 hover:underline">
             <img src='./icon/10.PNG' alt="Dashboard"  />
            <span className="text-secondar">Dashboard</span>
            </a>
           
          </div>

         
        </li>
      {menu.map((section, index) => (
        <li key={index} >
          {/* Section Title */}
          <div className="">
            <img src={section.icon} alt={section.title}  />
            <span className="text-secondar">{section.title}</span>
          </div>

          {/* Section Pages */}
          <ul >
            {section.pages.map((page, idx) => (
              <li key={idx} >
                <a href={page.pageLink} className="text-blue-600 hover:underline">
                  {page.pageName}
                </a>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export default Sidebar;
