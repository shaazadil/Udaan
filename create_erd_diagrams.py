import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

os.makedirs('assets', exist_ok=True)

def draw_entity(ax, x, y, w, h, name):
    # ERDPlus style entity box
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.08',
                                  edgecolor='#1B4F72', facecolor='#EBF5FB', lw=2.2, zorder=2)
    ax.add_patch(rect)
    ax.text(x + w/2, y + h/2, name, ha='center', va='center',
            fontsize=11, fontweight='bold', color='#0B2545', zorder=3)

def draw_attribute(ax, x, y, text, is_pk=False, is_fk=False, parent_x=None, parent_y=None, rx=1.1, ry=0.38):
    # ERDPlus style attribute oval
    edge_color = '#B7950B' if is_pk else ('#7D3C98' if is_fk else '#7F8C8D')
    face_color = '#FEFDE8' if is_pk else ('#F4ECF7' if is_fk else '#FDFEFE')
    
    ellipse = patches.Ellipse((x, y), rx*2, ry*2, edgecolor=edge_color, facecolor=face_color, lw=1.6, zorder=2)
    ax.add_patch(ellipse)
    
    label = text + (' (PK)' if is_pk else (' (FK)' if is_fk else ''))
    txt_color = '#7D6608' if is_pk else ('#5B2C6F' if is_fk else '#2C3E50')
    weight = 'bold' if is_pk else 'normal'
    style = 'italic' if is_fk else 'normal'
    
    ax.text(x, y, label, ha='center', va='center', fontsize=8.5, fontweight=weight, fontstyle=style, color=txt_color, zorder=3)
    
    if is_pk:
        # draw underline for PK
        str_len = len(label) * 0.05
        ax.plot([x - str_len, x + str_len], [y - 0.12, y - 0.12], color=txt_color, lw=1.2, zorder=4)
        
    if parent_x is not None and parent_y is not None:
        ax.plot([x, parent_x], [y, parent_y], color='#95A5A6', lw=1.2, ls='-', zorder=1)

def draw_relationship(ax, x, y, name, size=0.9):
    # ERDPlus style diamond
    pts = [[x, y + size], [x + size*1.3, y], [x, y - size], [x - size*1.3, y]]
    poly = patches.Polygon(pts, edgecolor='#117A65', facecolor='#E8F8F5', lw=2.2, zorder=2)
    ax.add_patch(poly)
    ax.text(x, y, name, ha='center', va='center', fontsize=9.5, fontweight='bold', color='#0E6251', zorder=3)

# ==============================================================================
# PART 1: CORE CAREER & APPLICATION ENTITIES
# ==============================================================================
fig, ax = plt.subplots(figsize=(15, 10), dpi=300)
ax.set_xlim(0, 20)
ax.set_ylim(0, 14)
ax.axis('off')

# Title
ax.text(10, 13.5, "UDAAN AI — Relational Conceptual Model (ERDPlus Style) — Part 1: Identity & Career Intelligence",
        ha='center', va='center', fontsize=14, fontweight='bold', color='#1B4F72')
ax.plot([1.5, 18.5], [13.1, 13.1], color='#BDC3C7', lw=1.5)

# Entities
draw_entity(ax, 2, 7.5, 3.2, 1.4, "USERS")
draw_attribute(ax, 1.2, 10.5, "id", is_pk=True, parent_x=2.5, parent_y=8.9)
draw_attribute(ax, 3.6, 10.6, "email", parent_x=3.5, parent_y=8.9)
draw_attribute(ax, 1.0, 9.4, "name", parent_x=2.2, parent_y=8.7)
draw_attribute(ax, 3.8, 9.5, "target_role", parent_x=3.7, parent_y=8.7)
draw_attribute(ax, 1.0, 6.0, "education", parent_x=2.2, parent_y=7.5)
draw_attribute(ax, 3.8, 6.0, "exp_summary", parent_x=3.6, parent_y=7.5)

draw_entity(ax, 8.5, 10.5, 3.2, 1.4, "RESUMES")
draw_attribute(ax, 7.5, 12.3, "id", is_pk=True, parent_x=8.8, parent_y=11.9)
draw_attribute(ax, 9.8, 12.5, "user_id", is_fk=True, parent_x=9.8, parent_y=11.9)
draw_attribute(ax, 12.1, 12.3, "title", parent_x=11.2, parent_y=11.9)
draw_attribute(ax, 12.6, 11.2, "raw_text", parent_x=11.7, parent_y=11.2)
draw_attribute(ax, 12.6, 10.0, "version_no", parent_x=11.7, parent_y=10.6)

draw_entity(ax, 8.5, 4.5, 3.2, 1.4, "JOBS")
draw_attribute(ax, 7.5, 2.7, "id", is_pk=True, parent_x=8.8, parent_y=4.5)
draw_attribute(ax, 9.8, 2.5, "user_id", is_fk=True, parent_x=9.8, parent_y=4.5)
draw_attribute(ax, 12.1, 2.7, "job_title", parent_x=11.2, parent_y=4.5)
draw_attribute(ax, 12.6, 3.8, "company", parent_x=11.7, parent_y=4.8)
draw_attribute(ax, 12.6, 5.2, "desc_text", parent_x=11.7, parent_y=5.4)

draw_entity(ax, 15.5, 4.5, 3.6, 1.4, "JOB_REQUIREMENTS")
draw_attribute(ax, 14.8, 2.5, "id", is_pk=True, parent_x=16.0, parent_y=4.5)
draw_attribute(ax, 17.2, 2.5, "job_id", is_fk=True, parent_x=17.0, parent_y=4.5)
draw_attribute(ax, 19.3, 3.6, "skill_id", is_fk=True, parent_x=19.1, parent_y=4.7)
draw_attribute(ax, 19.3, 5.0, "req_text", parent_x=19.1, parent_y=5.2)
draw_attribute(ax, 17.0, 6.7, "weight", parent_x=17.2, parent_y=5.9)

draw_entity(ax, 15.2, 10.5, 3.8, 1.4, "RESUME_ANALYSES")
draw_attribute(ax, 14.2, 12.5, "id", is_pk=True, parent_x=15.5, parent_y=11.9)
draw_attribute(ax, 16.5, 12.6, "resume_id", is_fk=True, parent_x=16.5, parent_y=11.9)
draw_attribute(ax, 18.8, 12.5, "job_id", is_fk=True, parent_x=18.0, parent_y=11.9)
draw_attribute(ax, 19.4, 11.2, "match_score", parent_x=19.0, parent_y=11.2)
draw_attribute(ax, 19.4, 9.8, "recommendations", parent_x=19.0, parent_y=10.5)

draw_entity(ax, 8.5, 7.5, 3.2, 1.4, "APPLICATIONS")
draw_attribute(ax, 7.2, 9.3, "id", is_pk=True, parent_x=8.5, parent_y=8.6)
draw_attribute(ax, 10.0, 9.3, "status", parent_x=10.0, parent_y=8.9)
draw_attribute(ax, 12.5, 8.2, "applied_date", parent_x=11.7, parent_y=8.2)

# Relationships Part 1
draw_relationship(ax, 6.0, 10.5, "uploads")
ax.plot([3.6, 5.0], [8.9, 10.5], color='#2C3E50', lw=1.8)
ax.text(3.8, 9.6, "(1, 1)", fontsize=9, fontweight='bold', color='#1B4F72')
ax.plot([7.0, 8.5], [10.5, 10.5], color='#2C3E50', lw=1.8)
ax.text(7.3, 10.7, "(0, N)", fontsize=9, fontweight='bold', color='#1B4F72')

draw_relationship(ax, 6.0, 5.2, "saves")
ax.plot([3.6, 5.0], [7.5, 5.2], color='#2C3E50', lw=1.8)
ax.text(3.8, 6.3, "(1, 1)", fontsize=9, fontweight='bold', color='#1B4F72')
ax.plot([7.0, 8.5], [5.2, 5.2], color='#2C3E50', lw=1.8)
ax.text(7.3, 5.4, "(0, N)", fontsize=9, fontweight='bold', color='#1B4F72')

draw_relationship(ax, 6.0, 8.2, "applies")
ax.plot([5.2, 5.0], [8.2, 8.2], color='#2C3E50', lw=1.8)
ax.text(4.4, 8.4, "(1, 1)", fontsize=9, fontweight='bold', color='#1B4F72')
ax.plot([7.0, 8.5], [8.2, 8.2], color='#2C3E50', lw=1.8)
ax.text(7.3, 8.4, "(0, N)", fontsize=9, fontweight='bold', color='#1B4F72')

ax.plot([10.1, 10.1], [5.9, 7.5], color='#2C3E50', lw=1.8)
ax.text(10.3, 6.7, "(1, N)", fontsize=9, fontweight='bold', color='#1B4F72')

draw_relationship(ax, 13.5, 5.2, "specifies")
ax.plot([11.7, 12.5], [5.2, 5.2], color='#2C3E50', lw=1.8)
ax.text(11.9, 5.4, "(1, 1)", fontsize=9, fontweight='bold', color='#1B4F72')
ax.plot([14.5, 15.5], [5.2, 5.2], color='#2C3E50', lw=1.8)
ax.text(14.6, 5.4, "(1, N)", fontsize=9, fontweight='bold', color='#1B4F72')

draw_relationship(ax, 13.5, 11.2, "aligned_with")
ax.plot([11.7, 12.5], [11.2, 11.2], color='#2C3E50', lw=1.8)
ax.text(11.9, 11.4, "(1, N)", fontsize=9, fontweight='bold', color='#1B4F72')
ax.plot([14.5, 15.2], [11.2, 11.2], color='#2C3E50', lw=1.8)
ax.text(14.4, 11.4, "(0, N)", fontsize=9, fontweight='bold', color='#1B4F72')

# Connected down from JOBS to RESUME_ANALYSES
ax.plot([10.5, 13.5], [5.9, 10.3], color='#7F8C8D', lw=1.5, ls='--')

plt.tight_layout()
plt.savefig('assets/erdplus_part1.png')
plt.close()
print("Generated assets/erdplus_part1.png successfully!")

# ==============================================================================
# PART 2: SKILLS, ROADMAPS, MOCK INTERVIEWS & KNOWLEDGE BASE
# ==============================================================================
fig2, ax2 = plt.subplots(figsize=(16, 11), dpi=300)
ax2.set_xlim(0, 22)
ax2.set_ylim(0, 15)
ax2.axis('off')

ax2.text(11, 14.5, "UDAAN AI — Relational Conceptual Model (ERDPlus Style) — Part 2: Skills, Roadmaps, Interviews & RAG",
         ha='center', va='center', fontsize=14, fontweight='bold', color='#1B4F72')
ax2.plot([1.5, 20.5], [14.1, 14.1], color='#BDC3C7', lw=1.5)

# Row 1: Skills & User Skills
draw_entity(ax2, 1.5, 11.0, 3.2, 1.3, "SKILLS")
draw_attribute(ax2, 1.0, 13.0, "id", is_pk=True, parent_x=2.2, parent_y=12.3)
draw_attribute(ax2, 3.0, 13.1, "name", parent_x=3.0, parent_y=12.3)
draw_attribute(ax2, 4.8, 12.8, "category", parent_x=4.0, parent_y=12.3)

draw_entity(ax2, 8.5, 11.0, 3.6, 1.3, "USER_SKILLS")
draw_attribute(ax2, 7.5, 13.0, "id", is_pk=True, parent_x=8.8, parent_y=12.3)
draw_attribute(ax2, 9.8, 13.2, "user_id", is_fk=True, parent_x=9.8, parent_y=12.3)
draw_attribute(ax2, 12.0, 13.0, "skill_id", is_fk=True, parent_x=11.2, parent_y=12.3)
draw_attribute(ax2, 12.7, 11.7, "proficiency", parent_x=12.1, parent_y=11.7)
draw_attribute(ax2, 12.7, 10.4, "confidence", parent_x=12.1, parent_y=11.2)

draw_relationship(ax2, 6.0, 11.6, "catalogues")
ax2.plot([4.7, 5.0], [11.6, 11.6], color='#2C3E50', lw=1.8)
ax2.text(4.8, 11.8, "(1, 1)", fontsize=8.5, fontweight='bold', color='#1B4F72')
ax2.plot([7.0, 8.5], [11.6, 11.6], color='#2C3E50', lw=1.8)
ax2.text(7.3, 11.8, "(0, N)", fontsize=8.5, fontweight='bold', color='#1B4F72')

# Row 2: Learning Roadmaps & Milestones
draw_entity(ax2, 1.5, 6.8, 3.6, 1.3, "LEARNING_ROADMAPS")
draw_attribute(ax2, 1.0, 8.8, "id", is_pk=True, parent_x=2.2, parent_y=8.1)
draw_attribute(ax2, 3.2, 8.9, "user_id", is_fk=True, parent_x=3.2, parent_y=8.1)
draw_attribute(ax2, 5.0, 8.7, "target_role", parent_x=4.5, parent_y=8.1)

draw_entity(ax2, 8.5, 6.8, 3.8, 1.3, "ROADMAP_MILESTONES")
draw_attribute(ax2, 7.5, 8.8, "id", is_pk=True, parent_x=8.8, parent_y=8.1)
draw_attribute(ax2, 9.8, 8.9, "roadmap_id", is_fk=True, parent_x=9.8, parent_y=8.1)
draw_attribute(ax2, 12.2, 8.8, "skill_id", is_fk=True, parent_x=11.5, parent_y=8.1)
draw_attribute(ax2, 12.8, 7.5, "step_order", parent_x=12.3, parent_y=7.5)
draw_attribute(ax2, 12.8, 6.3, "practice_task", parent_x=12.3, parent_y=7.0)

draw_relationship(ax2, 6.2, 7.4, "curates")
ax2.plot([5.1, 5.3], [7.4, 7.4], color='#2C3E50', lw=1.8)
ax2.text(5.2, 7.6, "(1, 1)", fontsize=8.5, fontweight='bold', color='#1B4F72')
ax2.plot([7.1, 8.5], [7.4, 7.4], color='#2C3E50', lw=1.8)
ax2.text(7.3, 7.6, "(1, N)", fontsize=8.5, fontweight='bold', color='#1B4F72')

draw_entity(ax2, 15.5, 6.8, 3.2, 1.3, "PROJECTS")
draw_attribute(ax2, 15.0, 8.8, "id", is_pk=True, parent_x=16.0, parent_y=8.1)
draw_attribute(ax2, 17.2, 8.8, "roadmap_id", is_fk=True, parent_x=17.0, parent_y=8.1)
draw_attribute(ax2, 19.3, 7.5, "technologies", parent_x=18.7, parent_y=7.5)

draw_relationship(ax2, 13.6, 7.4, "applies")
ax2.plot([12.3, 12.8], [7.4, 7.4], color='#2C3E50', lw=1.8)
ax2.text(12.5, 7.6, "(1, 1)", fontsize=8.5, fontweight='bold', color='#1B4F72')
ax2.plot([14.4, 15.5], [7.4, 7.4], color='#2C3E50', lw=1.8)
ax2.text(14.6, 7.6, "(0, N)", fontsize=8.5, fontweight='bold', color='#1B4F72')

# Row 3: Interview Sessions, Questions, Answers, Evaluations
draw_entity(ax2, 1.5, 2.2, 3.6, 1.3, "INTERVIEW_SESSIONS")
draw_attribute(ax2, 0.8, 4.1, "id", is_pk=True, parent_x=2.2, parent_y=3.5)
draw_attribute(ax2, 2.8, 4.3, "category", parent_x=3.0, parent_y=3.5)
draw_attribute(ax2, 4.7, 4.1, "overall_score", parent_x=4.2, parent_y=3.5)

draw_entity(ax2, 7.8, 2.2, 3.8, 1.3, "INTERVIEW_QUESTIONS")
draw_attribute(ax2, 7.2, 4.1, "id", is_pk=True, parent_x=8.2, parent_y=3.5)
draw_attribute(ax2, 9.4, 4.3, "session_id", is_fk=True, parent_x=9.4, parent_y=3.5)
draw_attribute(ax2, 11.5, 4.1, "skill_id", is_fk=True, parent_x=10.8, parent_y=3.5)

draw_relationship(ax2, 6.0, 2.8, "presents")
ax2.plot([5.1, 5.2], [2.8, 2.8], color='#2C3E50', lw=1.8)
ax2.text(5.2, 3.0, "(1, 1)", fontsize=8.5, fontweight='bold', color='#1B4F72')
ax2.plot([6.8, 7.8], [2.8, 2.8], color='#2C3E50', lw=1.8)
ax2.text(7.0, 3.0, "(1, N)", fontsize=8.5, fontweight='bold', color='#1B4F72')

draw_entity(ax2, 13.8, 2.2, 3.4, 1.3, "INTERVIEW_ANSWERS")
draw_attribute(ax2, 13.2, 4.1, "id", is_pk=True, parent_x=14.5, parent_y=3.5)
draw_attribute(ax2, 15.3, 4.1, "question_id", is_fk=True, parent_x=15.2, parent_y=3.5)

draw_relationship(ax2, 12.6, 2.8, "receives")
ax2.plot([11.6, 11.8], [2.8, 2.8], color='#2C3E50', lw=1.8)
ax2.text(11.8, 3.0, "(1, 1)", fontsize=8.5, fontweight='bold', color='#1B4F72')
ax2.plot([13.4, 13.8], [2.8, 2.8], color='#2C3E50', lw=1.8)
ax2.text(13.4, 3.0, "(1, 1)", fontsize=8.5, fontweight='bold', color='#1B4F72')

draw_entity(ax2, 18.8, 2.2, 3.0, 1.3, "ANSWER_EVALS")
draw_attribute(ax2, 18.0, 4.1, "id", is_pk=True, parent_x=19.2, parent_y=3.5)
draw_attribute(ax2, 20.2, 4.1, "score", parent_x=20.0, parent_y=3.5)

draw_relationship(ax2, 17.9, 2.8, "grades", size=0.7)
ax2.plot([17.2, 17.4], [2.8, 2.8], color='#2C3E50', lw=1.8)
ax2.text(17.3, 3.0, "(1, 1)", fontsize=8.5, fontweight='bold', color='#1B4F72')
ax2.plot([18.5, 18.8], [2.8, 2.8], color='#2C3E50', lw=1.8)
ax2.text(18.5, 3.0, "(1, 1)", fontsize=8.5, fontweight='bold', color='#1B4F72')

# Knowledge Base & Tags
draw_entity(ax2, 15.5, 11.0, 3.0, 1.3, "DOCUMENTS")
draw_attribute(ax2, 15.0, 13.0, "id", is_pk=True, parent_x=16.0, parent_y=12.3)
draw_attribute(ax2, 17.0, 13.2, "title", parent_x=17.0, parent_y=12.3)
draw_attribute(ax2, 19.0, 13.0, "content", parent_x=18.0, parent_y=12.3)

draw_entity(ax2, 19.5, 11.0, 2.2, 1.3, "TAGS")
draw_attribute(ax2, 20.2, 13.0, "id", is_pk=True, parent_x=20.2, parent_y=12.3)

draw_relationship(ax2, 18.9, 11.6, "tagged", size=0.6)
ax2.plot([18.5, 18.5], [11.6, 11.6], color='#2C3E50', lw=1.8)
ax2.plot([19.3, 19.5], [11.6, 11.6], color='#2C3E50', lw=1.8)

plt.tight_layout()
plt.savefig('assets/erdplus_part2.png')
plt.close()
print("Generated assets/erdplus_part2.png successfully!")
