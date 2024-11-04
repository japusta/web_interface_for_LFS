document.addEventListener('DOMContentLoaded', function() {
    const filesystemElement = document.getElementById('filesystem');

    async function fetchFilesystem(path = '') {
        const response = await fetch(`/filesystem/${path}`);
        if (!response.ok) {
            throw new Error('Failed to fetch filesystem data');
        }
        return response.json();
    }

    function createListItem(name, isDirectory = false) {
        const item = document.createElement('li');
        item.textContent = name;
        item.style.cursor = 'pointer';
        if (isDirectory) {
            item.classList.add('directory');
        }
        return item;
    }

    function toggleSublist(item) {
        const sublist = item.querySelector('ul');
        if (sublist) {
            sublist.style.display = sublist.style.display === 'none' ? 'block' : 'none';
        }
    }

    function displayFilesystem(data, container) {
        const list = document.createElement('ul');

        data.directories.forEach(dir => {
            const dirItem = createListItem(dir.path, true);
            dirItem.addEventListener('click', function(e) {
                // Prevent the click from propagating up the chain
                e.stopPropagation();

                const alreadyLoaded = dirItem.classList.contains('loaded');
                
                // Toggle the sublist display if it's already loaded
                if (alreadyLoaded) {
                    toggleSublist(dirItem);
                } else {
                    // Mark as loaded to avoid refetching the same directory
                    dirItem.classList.add('loaded');
                    fetchFilesystem(dir.path).then(subdir => {
                        displayFilesystem(subdir, dirItem);
                        toggleSublist(dirItem); // Show the newly added sublist
                    });
                }
            });
            list.appendChild(dirItem);
        });

        data.files.forEach(file => {
            const fileItem = createListItem(file);
            list.appendChild(fileItem);
        });

        // Clear any previous contents and append the new list
        const existingList = container.querySelector('ul');
        if (existingList) {
            container.replaceChild(list, existingList);
        } else {
            container.appendChild(list);
        }
    }

    fetchFilesystem().then(data => displayFilesystem(data, filesystemElement))
        .catch(error => console.error('Error loading filesystem:', error));
});
