import { Component, OnInit } from '@angular/core';
import { Project } from '../../model/project.model';
import { ProjectService } from '../../service/project.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent {

  projects: Project[] = [];
  showDialog: boolean = false;
  newProject: Project = this.nullNewProjectObject();
  isEditMode: boolean = false;

  constructor(
    private projectService: ProjectService,
    private messageService: MessageService,
    private confirmationService : ConfirmationService
  ){}

  ngOnInit() {
    this.loadProjects();
  }

  /**
   * Load projects
   */
  private loadProjects(){
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
      },
      error: (err) => {
        console.log('Failed to load project: ', err);
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to load projects'});
      }
    });
  }

  onSubmit(){
    if(this.isEditMode){
      this.handleEditProject();
    }else{
      this.handleAddNewProject();
    }
    
  }

  handleAddNewProject(){
    this.projectService.createProject(this.newProject).subscribe({
      next: (response) => {
        this.handleSubmitSuccess('Project added successfully');
      },
      error: (err) => {
        this.handleSubmitError('Failed to add project', err);
      }
    });
  }

  handleEditProject(){
    this.projectService.updateProject(this.newProject).subscribe({
      next: (response) => {
        this.handleSubmitSuccess('Project updated successfully');
      },
      error: (err) => {
        this.handleSubmitError('Failed to update project', err);
      }
    })
  }

  handleSubmitSuccess(message: string){
    this.loadProjects();
    this.closeDialog();
    this.newProject = this.nullNewProjectObject();
    this.messageService.add({severity: 'success', summary: 'Success', detail:message})
  }

  handleSubmitError(message: string, error: any){
    console.log(message, error);
    this.messageService.add({severity: 'error', summary: 'Error', detail: message});
  }

  nullNewProjectObject() : Project{
    return {id:null, name: '', description: '', createdDate: null};
  }

  openDialog(){
    this.isEditMode = false;
    this.showDialog = true;
    this.newProject = this.nullNewProjectObject();
  }

  closeDialog(){
    this.showDialog = false;
  }

  editProject(project: Project){
    this.showDialog = true;
    this.isEditMode = true;
    this.newProject = { ...project };
  }

  deleteProject(project: Project){
    this.messageService.clear();
    this.confirmationService.confirm({
      key: 'confirm',
      message: `Are you sure to delete project "${project.name}"?`,
      header: 'Confirm to delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Confirm Yes to delete project
        this.projectService.deleteProject(project.id!).subscribe({
          next: () => {
            this.loadProjects();
            this.messageService.add({severity: 'success', summary: 'Success', detail: 'Delete project successfully'});
          },
          error: (err) => {
            console.log('Failed to delete project: ', err);
            this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to delete project'});
          }
        })
      },
      reject: () => {
        // Confirm No (not to delete project)
        //this.messageService.add({severity: 'info', summary: 'Cancelled', detail: 'Cancel deletion'});
      }
    })
  }

}
