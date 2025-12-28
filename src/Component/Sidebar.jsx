import React from "react";
import icon1 from '../assets/icon/1.PNG';
import icon4 from '../assets/icon/4.PNG';
import icon5 from '../assets/icon/5.PNG';
import icon8 from '../assets/icon/8.PNG';
import icon10 from '../assets/icon/10.PNG';


const menu = [
  {
    title: "Role Management",
    icon: icon1,
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
    icon: icon8,
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
        pageName: "Create Exam",
        pageLink: "/add_exam",
      },
       {
        pageName: "add Year",
        pageLink: "/add_year",
      },
       {
        pageName: "Manage Exams",
        pageLink: "/manage_exam",
      },
       {
        pageName: "Create Exam",
        pageLink: "/add_exam",
      },
      {
        pageName: "Questions Management",
        pageLink: "/questions",
      },
    ],
  },
    {
    title: "Staff Management",
    icon: icon4,
    pages: [
      {
        pageName: "Add Staff",
        pageLink: "/add_staff",
      },
      {
        pageName: "Staff Management",
        pageLink: "/staff",
      },
    ],
  },
   {
    title: "Blog Management",
    icon: icon4,
    pages: [
      {
        pageName: "Add  Blog post",
        pageLink: "/create_blog",
      },
      {
        pageName: "Blog Posts",
        pageLink: "/manage_post",
      },
    ],
  },
  /*
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
  },*/
   {
    title: "plan Management",
    icon: icon8,
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
