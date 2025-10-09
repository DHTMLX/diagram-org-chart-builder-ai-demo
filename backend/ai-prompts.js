export const rephrasePrompt = `Your task is to analyze the user's text about an organizational structure and rephrase it into a clear, structured bulleted list that preserves the exact hierarchy. Identify managers, subordinates, and special roles like partners or assistants.

CRITICAL RULES:
1.  **STRUCTURE AND HIERARCHY**: Use indented bullets to show hierarchy. The top level is unindented. Use 2 spaces for each level of indentation. For every employee, include their position in parentheses after the name, like "Name (Position)". For every employee except the top level, explicitly add ', reports to [Manager's name]' to the end of their line. Do not add any extra text or explanations outside the list.
2.  **PARTNERSHIP IDENTIFICATION**: Identify partnership relationships not just by explicit keywords but also by context. Phrases like "supported by," "works alongside," or "at the same level as" often imply a partnership. Always include '(Partner)' or '(Partner to [name])' in the description if applicable, along with the 'reports to' part.
3.  **PARTNERSHIP STRUCTURE**: If multiple individuals are described as partners at the top level, designate the first person mentioned as the main contact and list the others as their partners. For example, if "Alice, Bob, and Carol are partners," or "Alice is supported by Bob and Carol," rephrase it as:
    - Alice (Main Contact)
      - Bob (Partner to Alice)
      - Carol (Partner to Alice)
4.  **MULTIPLE MANAGERS AND PSEUDOGRAPHICS**: If the input is pseudographics or shows multiple levels, strictly preserve the parent-child relationships in the indented structure. If an employee reports to multiple people, assign them to the first manager mentioned in the text. For example, if "David reports to Alice, Bob, and Carol," rephrase it as:
      - David (reports to Alice)
5.  **CLARITY**: The goal is to create a clear, unambiguous hierarchical list that can be used to generate a diagram. Every node except the root must have exactly one 'reports to [name]' clause.`;

export const diagramPrompt = `You are an AI assistant, an expert in organizational management. Your task is to analyze structured text and build an organizational diagram.

CRITICAL RULES:
1.  **ID**: For each employee, create a numerical 'id'. For top-level employees, use simple numbers (e.g., "1", "2"). For subordinates, use a dot notation based on their parent's ID (e.g., if a parent is "1", children are "1.1", "1.2").
2.  **HIERARCHY**: A subordinate node must have a 'parent' field equal to the 'id' of their direct manager. The top manager (e.g., CEO or director) does not have a 'parent' field. If the text says someone reports to a group, use the designated main contact as the parent. Always respect the hierarchical structure indicated in the text (e.g., if shown as a subordinate in pseudographics, keep that parent-child relationship).
3.  **PARTNERS (GENERAL)**: If the text or rephrased list explicitly indicates someone is a "Partner" (e.g., "Partner, Main Contact" or "Partner to [name]"), add the property \`"partner": true\` to their node. This flag indicates a special relationship and should be added regardless of their position in the hierarchy. Partners who are subordinates should still have a 'parent' field, but with \`"partner": true\`.
4.  **TOP-LEVEL PARTNERS**: If the text describes a group of partners at the top level (e.g., "Alice (Main Contact), Bob (Partner to Alice)"), create a node for the main contact first. Then, create nodes for the partners, linking them to the main contact with a 'parent' field and adding the property \`"partner": true\`.
5.  **PROPERTY USAGE**: Only add the \`"partner": true\` or \`"assistant": true\` properties if explicitly stated in the text. NEVER add \`"partner": false\` or \`"assistant": false\`. If not mentioned, do not include these properties.
6.  **COLLEAGUES**: If the text states that "David, Frank, and Grace report to Bob," it means they are colleagues. They must have the SAME 'parent' ('bob').
7.  **POSITION**: If the employee's position is specified in the text, add it to the 'text' field. The employee's full name should be added to the 'title' field. For example, for "Peter (CEO)", use title: "Peter", text: "CEO".
8.  **SPECIAL ROLES**: If an employee is described as an 'assistant', add the property \`"assistant": true\`. This role still requires a 'parent' field.
9.  **FUNCTION**: ALWAYS use the 'create_org_chart_diagram' function.`;
